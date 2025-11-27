import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  
  aberto = false;
  mensagens: any[] = [];
  textoInput = '';
  usuarioLogado: any = null;
  intervalo: any;

  // Para rolar o scroll pra baixo
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  ngOnInit() {
    // Só mostra o chat se estiver logado e NÃO for admin
    this.api.usuario$.subscribe(u => {
      this.usuarioLogado = u;
      if (this.usuarioLogado && this.usuarioLogado.role !== 'admin') {
        this.iniciarPolling();
      } else {
        this.pararPolling();
      }
    });
  }

  ngOnDestroy() {
    this.pararPolling();
  }

  toggleChat() {
    this.aberto = !this.aberto;
    if (this.aberto) this.scrollToBottom();
  }

  iniciarPolling() {
    this.carregarMensagens();
    // Atualiza a cada 3 segundos
    this.intervalo = setInterval(() => this.carregarMensagens(), 3000);
  }

  pararPolling() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  carregarMensagens() {
    if (!this.usuarioLogado) return;
    
    this.api.getMensagensUser().subscribe((dados: any) => {
      this.mensagens = dados;
      // Se tiver mensagem nova e o chat estiver aberto, rola pra baixo
      if (this.aberto) setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  enviar() {
    if (!this.textoInput.trim()) return;

    this.api.enviarMensagemUser(this.textoInput).subscribe(() => {
      this.textoInput = '';
      this.carregarMensagens();
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}