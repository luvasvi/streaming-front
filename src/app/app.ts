import { Component, OnInit, HostListener } from '@angular/core'; // Adicionado HostListener
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from './services/movie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  filmes: any[] = []; 
  pessoasEncontradas: any[] = []; 
  filmeSelecionado: any = null; 
  carregando: boolean = false;
  mostrarTrailer: boolean = false;
  
  // --- VARIÁVEIS INFINITE SCROLL ---
  emListagem: boolean = false;
  paginaAtual: number = 1;
  bloquearScroll: boolean = false;
  idGeneroAtivo: number | null = null;
  termoBuscaAtual: string | null = null;

  // --- VARIÁVEIS NOTIFICAÇÕES (TOAST) ---
  toastMensagem: string | null = null;
  toastTipo: 'success' | 'error' = 'success';

  generos = [
    { id: 28, nome: 'Ação' },
    { id: 12, nome: 'Aventura' },
    { id: 16, nome: 'Animação' },
    { id: 35, nome: 'Comédia' },
    { id: 80, nome: 'Crime' },
    { id: 27, nome: 'Terror' },
    { id: 14, nome: 'Fantasia' },
    { id: 878, nome: 'Ficção' },
    { id: 10749, nome: 'Romance' },
    { id: 53, nome: 'Suspense' }
  ];

  generoAtivo: string | null = null;
  trending: any[] = [];
  populares: any[] = [];
  artistaNome: string | null = null; 
  filmeDeOrigem: any = null; 
  favoritos: any[] = [];

  constructor(
    private movieService: MovieService,
    private sanitizer: DomSanitizer 
  ) {}

  ngOnInit() {
    this.carregarHome();
    this.carregarFavoritos();
  }

  // --- DETECTAR ROLAGEM (INFINITE SCROLL) ---
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Não carrega se já estiver carregando, se estiver nos detalhes ou se não houver lista
    if (this.carregando || this.bloquearScroll || this.filmeSelecionado || !this.emListagem) return;

    const posicaoAtual = window.innerHeight + window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight;

    // Quando faltar 400px para o fim da página, busca a próxima
    if (posicaoAtual >= alturaTotal - 400) {
      this.carregarMais();
    }
  }

  // --- LÓGICA DE NAVEGAÇÃO ---

  irParaHome() {
    this.filmeSelecionado = null;
    this.filmes = [];
    this.pessoasEncontradas = [];
    this.artistaNome = null;
    this.generoAtivo = null;
    this.emListagem = false;
    this.mostrarTrailer = false;
    this.filmeDeOrigem = null;
    this.paginaAtual = 1;
    this.termoBuscaAtual = null;
    window.scrollTo(0, 0);
  }

  voltar() {
    if (this.filmeSelecionado) {
      this.filmeSelecionado = null;
      this.mostrarTrailer = false;
    } else if (this.emListagem || this.artistaNome) {
      this.irParaHome();
    }
  }

  // --- BUSCAS E FILTROS COM PAGINAÇÃO ---

  buscarPorGenero(id: number, nome: string) {
    this.carregando = true;
    this.generoAtivo = nome;
    this.idGeneroAtivo = id;
    this.emListagem = true;
    this.artistaNome = null;
    this.paginaAtual = 1; // Reseta para primeira página
    this.filmes = [];

    this.movieService.getMovie(`genre/${id}?page=${this.paginaAtual}`).subscribe({
      next: (dados: any) => {
        this.filmes = this.normalizarLista(dados);
        this.carregando = false;
        this.filmeSelecionado = null;
      },
      error: () => this.carregando = false
    });
  }

  buscarFilme(titulo: string) {
    if (!titulo) return;
    this.carregando = true;
    this.termoBuscaAtual = titulo;
    this.emListagem = true;
    this.artistaNome = null; 
    this.filmeDeOrigem = null; 
    this.generoAtivo = null;
    this.paginaAtual = 1;

    this.movieService.getMovie(`search/${titulo}?page=${this.paginaAtual}`).subscribe({
      next: (dados: any[]) => { 
        const dadosNormalizados = this.normalizarLista(dados);
        this.pessoasEncontradas = dadosNormalizados.filter(d => d.media_type === 'person'); 
        this.filmes = dadosNormalizados.filter(d => d.media_type !== 'person'); 
        this.carregando = false; 
        this.filmeSelecionado = null; 
      },
      error: () => this.carregando = false
    });
  }

  carregarMais() {
    this.paginaAtual++;
    this.bloquearScroll = true;

    // Define a rota baseada no que está sendo exibido
    const path = this.generoAtivo 
      ? `genre/${this.idGeneroAtivo}?page=${this.paginaAtual}`
      : `search/${this.termoBuscaAtual}?page=${this.paginaAtual}`;

    this.movieService.getMovie(path).subscribe({
      next: (novosDados: any) => {
        const novosFilmes = this.normalizarLista(novosDados);
        if (novosFilmes.length > 0) {
          // O segredo do Infinite Scroll: Adiciona os novos filmes ao final da lista atual
          this.filmes = [...this.filmes, ...novosFilmes];
          this.bloquearScroll = false;
        }
      },
      error: () => this.bloquearScroll = false
    });
  }

  // --- FAVORITOS E NOTIFICAÇÕES (TOAST) ---

  showToast(mensagem: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensagem = mensagem;
    this.toastTipo = tipo;
    setTimeout(() => this.toastMensagem = null, 3000); // Some após 3 segundos
  }

  toggleFavorito(filme: any, event: Event) {
    event.stopPropagation();
    const index = this.favoritos.findIndex(f => f.id === filme.id);
    const titulo = filme.title || filme.name;

    if (index === -1) {
      this.favoritos.push(filme);
      this.showToast(`"${titulo}" adicionado aos favoritos!`);
    } else {
      this.favoritos.splice(index, 1);
      this.showToast(`"${titulo}" removido dos favoritos.`, 'error');
    }
    
    localStorage.setItem('minhaLista', JSON.stringify(this.favoritos));
  }

  // --- RESTANTE DOS MÉTODOS ---

  buscarPorPessoa(nome: string) {
    if (!nome || nome === 'Não informado') return;
    if (this.filmeSelecionado) this.filmeDeOrigem = this.filmeSelecionado;

    this.carregando = true;
    this.artistaNome = nome;
    this.emListagem = true;
    this.filmeSelecionado = null; 
    this.pessoasEncontradas = []; 
    this.generoAtivo = null;

    this.movieService.getMovie(`person/${nome}`).subscribe({
      next: (dados: any) => { 
        this.filmes = this.normalizarLista(dados); 
        this.carregando = false; 
      },
      error: () => this.carregando = false
    });
  }

  getSafeUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${key}?autoplay=1`);
  }

  normalizarLista(dados: any[]): any[] {
    if (!dados) return [];
    return dados.map(item => {
      const dataBruta = item.release_date || item.releaseDate || item.first_air_date || item.firstAirDate;
      const ano = dataBruta ? dataBruta.substring(0, 4) : '';
      return {
        ...item,
        media_type: item.media_type || item.mediaType,
        poster_path: item.poster_path || item.posterPath,
        profile_path: item.profile_path || item.profilePath,
        vote_average: item.vote_average || item.voteAverage,
        anoLancamento: ano 
      };
    });
  }

  carregarHome() {
    this.carregando = true;
    this.movieService.getMovie('trending?page=1').subscribe({
      next: (dados: any) => { 
        this.trending = this.normalizarLista(dados); 
        this.carregando = false; 
      },
      error: () => this.carregando = false
    });

    this.movieService.getMovie('popular-people').subscribe({
      next: (dados: any) => this.populares = this.normalizarLista(dados),
      error: () => {}
    });
  }

  carregarFavoritos() {
    const salvos = localStorage.getItem('minhaLista');
    if (salvos) this.favoritos = JSON.parse(salvos);
  }

  isFavorito(filmeId: number): boolean {
    return this.favoritos.some(f => f.id === filmeId);
  }

  verDetalhes(filme: any) {
    this.carregando = true;
    this.mostrarTrailer = false; 
    const busca = filme.title || filme.name;

    this.movieService.getMovie(`details/${busca}`).subscribe({
      next: (detalhes: any) => {
        detalhes.poster_path = detalhes.poster_path || detalhes.posterPath;
        const dataBruta = detalhes.release_date || detalhes.releaseDate || detalhes.first_air_date || detalhes.firstAirDate;
        detalhes.anoLancamento = dataBruta ? dataBruta.substring(0, 4) : '';

        if (detalhes.cast) detalhes.cast = this.normalizarLista(detalhes.cast);
        if (detalhes.recommendations) detalhes.recommendations = this.normalizarLista(detalhes.recommendations);

        this.filmeSelecionado = detalhes;
        this.carregando = false;
        window.scrollTo(0, 0); 
      },
      error: () => this.carregando = false
    });
  }

  voltarParaLista() { this.irParaHome(); }

  voltarParaFilmeAnterior() {
    this.filmeSelecionado = this.filmeDeOrigem;
    this.filmeDeOrigem = null;
    this.artistaNome = null;
  }
  // Transforma minutos em formato de horas e minutos
formatarDuracao(minutos: number): string {
  if (!minutos || minutos === 0) return '';
  const horas = Math.floor(minutos / 60);
  const min = minutos % 60;
  return horas > 0 ? `${horas}h ${min}min` : `${min}min`;
}

// Transforma números em formato de moeda (Dólar)
formatarMoeda(valor: number): string {
  if (!valor || valor === 0) return 'Não informado';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(valor);
}
}
