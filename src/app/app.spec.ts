import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app'; // Sem o .ts no final

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Como o seu componente é Standalone, ele entra em imports
      imports: [AppComponent],
      // Precisamos destes providers porque o seu App usa o MovieService (que usa HTTP)
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Renderiza o HTML para o teste conseguir ler
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verifica se o título do seu Header (FTTB) está presente
    expect(compiled.querySelector('h1')?.textContent).toContain('FTTB');
  });
});