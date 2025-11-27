import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core'; // ViewChild importado aqui
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms'; // <--- IMPORTANTE: FormsModule aqui
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    DatePipe
  ], 
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})


export class AdminDashboardComponent implements OnInit {
  api = inject(ApiService);

  // Variáveis Chat
  conversas: any[] = [];
  chatAtivo: any = null;
  msgsAdmin: any[] = [];
  txtAdmin = '';
  intervaloAdmin: any;
  @ViewChild('scrollAdmin') private scrollAdmin!: ElementRef;
  
  // Listas de Dados
  consultas: any[] = [];
  imagensSlider: any[] = [];
  
  // Controle de Upload
  formSlider = new FormGroup({
    titulo: new FormControl('', [Validators.required])
  });
  arquivoSelecionado: File | null = null;

  ngOnInit() {
    this.carregarDados();
    this.carregarConversas();
  }

  // Função para carregar a lista lateral
  carregarConversas() {
    this.api.getConversasAdmin().subscribe((dados: any) => this.conversas = dados);
  }

  // Ao clicar num cliente
  abrirChatAdmin(usuario: any) {
    this.chatAtivo = usuario;
    this.carregarMsgsAdmin();
    
    // Polling específico desse chat
    if (this.intervaloAdmin) clearInterval(this.intervaloAdmin);
    this.intervaloAdmin = setInterval(() => this.carregarMsgsAdmin(), 3000);
  }

  carregarMsgsAdmin() {
    if(!this.chatAtivo) return;
    this.api.getMensagensPorUsuario(this.chatAtivo.id).subscribe((dados: any) => {
      this.msgsAdmin = dados;
      setTimeout(() => {
          try { this.scrollAdmin.nativeElement.scrollTop = this.scrollAdmin.nativeElement.scrollHeight; } catch(e){}
      }, 100);
    });
  }

  enviarAdmin() {
    if(!this.txtAdmin.trim()) return;
    this.api.enviarMensagemAdmin(this.chatAtivo.id, this.txtAdmin).subscribe(() => {
      this.txtAdmin = '';
      this.carregarMsgsAdmin();
      this.carregarConversas(); // Atualiza a lista lateral (última msg)
    });
  }

  // No ngOnDestroy, limpar o intervalo
  ngOnDestroy() {
      if (this.intervaloAdmin) clearInterval(this.intervaloAdmin);
  }

  carregarDados() {
    // 1. Busca Consultas
    this.api.getConsultas().subscribe((dados: any) => this.consultas = dados);

    // 2. Busca Imagens do Slider
    this.api.getImagensSlider().subscribe((dados: any) => {
      this.imagensSlider = dados.map((item: any) => ({
        ...item,
        urlCompleta: `http://localhost:5010/${item.caminho_imagem.replace(/\\/g, '/')}`
      }));
    });
  }

  // --- AÇÕES DE CONSULTA ---
  mudarStatus(id: number, novoStatus: string) {
    if (confirm(`Tem certeza que deseja mudar para "${novoStatus}"?`)) {
      this.api.atualizarStatusConsulta(id, novoStatus).subscribe({
        next: () => {
          alert('Status atualizado!');
          this.carregarDados();
        },
        error: () => alert('Erro ao atualizar status.')
      });
    }
  }

  // --- AÇÕES DE SLIDER ---
  onFileSelected(event: any) {
    this.arquivoSelecionado = event.target.files[0];
  }

  adicionarFoto() {
    if (this.formSlider.invalid || !this.arquivoSelecionado) {
      alert('Preencha o título e escolha uma foto.');
      return;
    }

    const titulo = this.formSlider.value.titulo as string;

    this.api.uploadSlider(titulo, this.arquivoSelecionado).subscribe({
      next: () => {
        alert('Projeto adicionado à Home!');
        this.formSlider.reset();
        this.arquivoSelecionado = null;
        this.carregarDados();
      },
      error: () => alert('Erro ao fazer upload.')
    });
  }

  deletarFoto(id: number) {
    if (confirm('Remover esta foto da Home?')) {
      this.api.deletarSlider(id).subscribe({
        next: () => this.carregarDados(),
        error: () => alert('Erro ao deletar.')
      });
    }
  }

  // CSS Helper
  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'confirmada': return 'badge-verde';
      case 'pendente': return 'badge-laranja';
      case 'cancelada': return 'badge-vermelho';
      default: return '';
    }
  }
}