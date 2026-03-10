import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../services/movie.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // ADICIONADO

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['../app.css', './home.css']
})
export class HomeComponent implements OnInit {
  filmes: any[] = []; 
  pessoasEncontradas: any[] = []; 
  filmeSelecionado: any = null; 
  carregando: boolean = false;
  mostrarTrailer: boolean = false;
  temporadaSelecionada: any = null;
  emListagem: boolean = false;
  paginaAtual: number = 1;
  bloquearScroll: boolean = false;
  idGeneroAtivo: number | null = null;
  termoBuscaAtual: string | null = null;
  temaEscuro: boolean = true;
  ordemSelecionada: string = 'popularity.desc';
  opcoesOrdenacao = [
    { label: '🔥 Mais Populares', value: 'popularity.desc' },
    { label: '⭐ Melhor Avaliados', value: 'vote_average.desc' },
    { label: '📅 Lançamentos', value: 'primary_release_date.desc' }
  ];
  toastMensagem: string | null = null;
  toastTipo: 'success' | 'error' = 'success';
  generos = [
    { id: 28, nome: 'Ação' }, { id: 12, nome: 'Aventura' }, { id: 16, nome: 'Animação' },
    { id: 35, nome: 'Comédia' }, { id: 80, nome: 'Crime' }, { id: 27, nome: 'Terror' },
    { id: 14, nome: 'Fantasia' }, { id: 878, nome: 'Ficção' }, { id: 10749, nome: 'Romance' },
    { id: 53, nome: 'Suspense' }
  ];
  generoAtivo: string | null = null;
  trending: any[] = [];
  populares: any[] = [];
  artistaNome: string | null = null; 
  favoritos: any[] = [];

  constructor(
    private movieService: MovieService, 
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private router: Router 
  ) {}

  ngOnInit() {
    this.carregarHome();
    this.carregarFavoritos();
  }

  // --- CONTROLE DE SESSÃO ---
  fazerLogout() {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  // --- LÓGICA DE FAVORITOS (INTEGRADA COM JWT) ---
  carregarFavoritos() {
    this.http.get<any[]>('http://localhost:8080/favorites').subscribe({
      next: (dados) => this.favoritos = dados,
      error: (err) => {
        // Se o token expirou ou é inválido, manda pro login
        if (err.status === 401 || err.status === 403) {
          this.fazerLogout();
        }
        console.error("Erro ao carregar favoritos", err);
      }
    });
  }

  toggleFavorito(filme: any, event: Event) {
    event.stopPropagation();
    const titulo = filme.title || filme.name;
    const favoritoExistente = this.favoritos.find(f => f.movieId === filme.id);

    if (!favoritoExistente) {
      const payload = {
        movieId: filme.id,
        title: titulo,
        posterPath: filme.poster_path
      };
      // O Interceptor anexa o Token Bearer automaticamente aqui
      this.http.post('http://localhost:8080/favorites/add', payload).subscribe({
        next: (res: any) => {
          this.favoritos.push(res);
          this.showToast(`"${titulo}" salvo nos favoritos!`);
        },
        error: () => this.showToast('Erro ao favoritar', 'error')
      });
    } else {
      this.http.delete(`http://localhost:8080/favorites/${filme.id}`).subscribe({
        next: () => {
          this.favoritos = this.favoritos.filter(f => f.movieId !== filme.id);
          this.showToast(`"${titulo}" removido.`, 'error');
        },
        error: () => this.showToast('Erro ao remover', 'error')
      });
    }
  }

  isFavorito(filmeId: number): boolean { 
    return this.favoritos.some(f => f.movieId === filmeId); 
  }

  // --- MÉTODOS DE NAVEGAÇÃO E TMDB (MANTIDOS) ---
  voltar() {
    if (this.artistaNome) {
      this.artistaNome = null;
      this.filmes = []; 
      return;
    }
    if (this.filmeSelecionado) {
      this.filmeSelecionado = null;
      this.temporadaSelecionada = null;
      this.mostrarTrailer = false;
      return;
    }
    this.emListagem = false;
    this.termoBuscaAtual = null;
    this.generoAtivo = null;
    this.filmes = []; 
    this.pessoasEncontradas = [];
    this.carregarHome(); 
  }

  buscarPorPessoa(nome: string) {
    if (!nome || nome === 'Não informado') return;
    this.carregando = true;
    this.artistaNome = nome;
    this.emListagem = true; 
    this.movieService.getMovie(`person/${nome}`).subscribe({
      next: (dados: any) => { 
        this.filmes = this.normalizarLista(dados); 
        this.carregando = false; 
      },
      error: () => this.carregando = false
    });
  }

  selecionarTemporada(season: any) {
    if (this.temporadaSelecionada?.season_number === season.season_number) {
      this.temporadaSelecionada = null;
      return;
    }
    this.carregando = true;
    const url = `series/${this.filmeSelecionado.id}/season/${season.season_number}`;
    this.movieService.getMovie(url).subscribe({
      next: (detalhes: any) => { 
        this.temporadaSelecionada = detalhes; 
        this.carregando = false; 
      },
      error: () => { 
        this.carregando = false; 
        this.showToast('Erro ao carregar episódios', 'error'); 
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.carregando || this.bloquearScroll || this.filmeSelecionado || !this.emListagem) return;
    const posicaoAtual = window.innerHeight + window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight;
    if (posicaoAtual >= alturaTotal - 400) this.carregarMais();
  }

  mudarFiltro() {
    if (this.idGeneroAtivo && this.generoAtivo) {
      this.filmes = []; 
      this.buscarPorGenero(this.idGeneroAtivo, this.generoAtivo);
    }
  }

  buscarPorGenero(id: number, nome: string) {
    this.carregando = true;
    this.generoAtivo = nome;
    this.idGeneroAtivo = id;
    this.emListagem = true;
    this.artistaNome = null;
    this.paginaAtual = 1; 
    this.filmes = [];
    const url = `genre/${id}?page=${this.paginaAtual}&sortBy=${this.ordemSelecionada}`;
    this.movieService.getMovie(url).subscribe({
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
    this.generoAtivo = null;
    this.paginaAtual = 1;
    this.movieService.getMovie(`search/${titulo}?page=${this.paginaAtual}`).subscribe({
      next: (dados: any[]) => { 
        const norm = this.normalizarLista(dados);
        this.pessoasEncontradas = norm.filter(d => d.media_type === 'person'); 
        this.filmes = norm.filter(d => d.media_type !== 'person'); 
        this.carregando = false; 
        this.filmeSelecionado = null; 
      },
      error: () => this.carregando = false
    });
  }

  carregarMais() {
    this.paginaAtual++;
    this.bloquearScroll = true;
    const path = this.generoAtivo 
      ? `genre/${this.idGeneroAtivo}?page=${this.paginaAtual}&sortBy=${this.ordemSelecionada}`
      : `search/${this.termoBuscaAtual}?page=${this.paginaAtual}`;
    this.movieService.getMovie(path).subscribe({
      next: (novos: any) => {
        const novosFilmes = this.normalizarLista(novos);
        if (novosFilmes.length > 0) {
          this.filmes = [...this.filmes, ...novosFilmes];
          this.bloquearScroll = false;
        }
      },
      error: () => this.bloquearScroll = false
    });
  }

  showToast(mensagem: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensagem = mensagem;
    this.toastTipo = tipo;
    setTimeout(() => this.toastMensagem = null, 3000);
  }

  getSafeUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${key}?autoplay=1`);
  }

  normalizarLista(dados: any[]): any[] {
    if (!dados) return [];
    return dados.map(item => {
      const dataBruta = item.release_date || item.releaseDate || item.first_air_date || item.firstAirDate;
      return {
        ...item,
        media_type: item.media_type || item.mediaType,
        poster_path: item.poster_path || item.posterPath,
        profile_path: item.profile_path || item.profilePath,
        vote_average: item.vote_average || item.voteAverage,
        anoLancamento: dataBruta ? dataBruta.substring(0, 4) : ''
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
      next: (dados: any) => this.populares = this.normalizarLista(dados)
    });
  }

  verDetalhes(filme: any) {
    this.carregando = true;
    this.artistaNome = null;
    this.mostrarTrailer = false; 
    this.temporadaSelecionada = null;
    const tipo = filme.media_type || (filme.title ? 'movie' : 'tv');
    const id = filme.id;
    this.movieService.getMovie(`details/${tipo}/${id}`).subscribe({
      next: (detalhes: any) => {
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

  formatarDuracao(m: number): string {
    if (!m) return '';
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}min` : `${m}min`;
  }

  formatarMoeda(v: number): string {
    if (!v) return 'Não informado';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }
}