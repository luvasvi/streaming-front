import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home';
import { MovieService } from '../services/movie.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. Importa os módulos necessários para o HTML funcionar
      imports: [
        HomeComponent, 
        HttpClientTestingModule, 
        FormsModule
      ],
      // 2. Garante que o serviço que usa JPA/API seja injetado
      providers: [MovieService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Teste sugerido para validar sua lógica de camadas
  it('deve limpar o artistaNome ao chamar voltar()', () => {
    component.artistaNome = 'Courteney Cox';
    component.voltar();
    expect(component.artistaNome).toBeNull();
  });
});