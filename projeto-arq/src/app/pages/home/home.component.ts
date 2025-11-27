import { Component, OnInit, AfterViewInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Project {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  private elementRef = inject(ElementRef);

  projects: Project[] = [];
  currentIndex: number = 0;
  
  // Variável para controlar para onde o botão vai
  rotaDestino: string = '/login'; 

  // Fotos Estáticas (Backup)
  fotosIniciais: Project[] = [
    { title: 'Banheiro Moderno', description: 'Conforto e elegância.', image: 'assets/images/banheiro.png' },
    { title: 'Cozinha Planejada', description: 'Funcionalidade dia a dia.', image: 'assets/images/lavabo.png' },
    { title: 'Quarto de Casal', description: 'Refúgio de tranquilidade.', image: 'assets/images/quarto.png' }
  ];

  ngOnInit() {
    this.projects = [...this.fotosIniciais];
    this.carregarSliderDinamic();

    // LÓGICA INTELIGENTE DE ROTA
    // Fica "ouvindo" o usuário. Se mudar (login/logout), atualiza o destino.
    this.api.usuario$.subscribe(usuario => {
      if (usuario) {
        // Se logado, manda pro painel correto
        this.rotaDestino = usuario.role === 'admin' ? '/painel-admin' : '/painel-usuario';
      } else {
        // Se deslogado, manda pro login
        this.rotaDestino = '/login';
      }
    });
  }


  // --- LÓGICA DO SCROLL FADE ---
  ngAfterViewInit() {
    // Cria o observador
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Se o elemento entrou na tela
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Opcional: Parar de observar depois que apareceu (para não animar de novo ao subir)
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Dispara quando 10% do elemento estiver visível
    });

    // Seleciona todos os elementos que têm a classe .fade-on-scroll
    const hiddenElements = this.elementRef.nativeElement.querySelectorAll('.fade-on-scroll');
    
    // Manda o observador vigiar cada um deles
    hiddenElements.forEach((el: any) => observer.observe(el));
  }



  carregarSliderDinamic() {
    this.api.getImagensSlider().subscribe({
      next: (dados: any[]) => {
        const novasImagens = dados.map((item) => ({
          // Mapeia o banco (titulo, descricao) para o HTML (title, description)
          title: item.titulo,
          description: item.descricao || 'Projeto Exclusivo TagN', // Usa descrição do banco ou padrão
          image: `http://localhost:5010/${item.caminho_imagem.replace(/\\/g, '/')}`
        }));

        // Junta tudo
        this.projects = [...this.fotosIniciais, ...novasImagens];
      },
      error: (erro) => console.log('Backend offline ou sem imagens, usando estáticas.')
    });
  }

  // --- LÓGICA DE NAVEGAÇÃO DO SLIDER ---

  nextSlide() {
    // Avança 1, se chegar no fim, volta para o 0
    this.currentIndex = (this.currentIndex + 1) % this.projects.length;
  }

  prevSlide() {
    // Volta 1, se for menor que 0, vai para o último
    this.currentIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  // Define as classes CSS (active, prev, next) com base no índice atual
  getSlideClass(index: number): string {
    if (index === this.currentIndex) {
      return 'slide-item--active';
    }

    // Lógica para definir quem é o anterior (prev) e o próximo (next) considerando o loop
    const prevIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    const nextIndex = (this.currentIndex + 1) % this.projects.length;

    if (index === prevIndex) {
      return 'slide-item--prev';
    }
    
    if (index === nextIndex) {
      return 'slide-item--next';
    }

    return ''; // Demais slides ficam ocultos (opacity 0 no CSS)
  }
}