import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs'; // <--- Adicione BehaviorSubject
import { Router } from '@angular/router'; // <--- Adicione Router

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  router = inject(Router);
  private baseUrl = 'http://localhost:5010'; // Sua API Node.js

  // 1. Criamos um "Assunto" que guarda o usuário atual
  private usuarioSubject = new BehaviorSubject<any>(null);
  
  // 2. Criamos uma variável pública que os componentes podem "assistir"
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    // 3. Ao iniciar o site, verifica se já tem alguém salvo no LocalStorage
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      this.usuarioSubject.next(JSON.parse(usuarioSalvo));
    }
  }

  // --- MÉTODOS DE AUTH ---

  login(credenciais: any): Observable<any> {
    return new Observable(obs => {
      this.http.post(`${this.baseUrl}/entrar`, credenciais).subscribe({
        next: (dados: any) => {
          // Salva no navegador
          localStorage.setItem('token', dados.token);
          localStorage.setItem('usuario', JSON.stringify(dados.usuario));
          
          // AVISA TODO MUNDO QUE LOGOU
          this.usuarioSubject.next(dados.usuario);

          obs.next(dados);
          obs.complete();
        },
        error: (err) => obs.error(err)
      });
    });
  }

  logout() {
    // Limpa tudo
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Avisa que deslogou (null)
    this.usuarioSubject.next(null);
    
    // Manda para o login
    this.router.navigate(['/login']);
  }


  cadastrar(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cadastrar`, usuario);
  }

  // --- SLIDER (HOME) ---
  getImagensSlider(): Observable<any> {
    return this.http.get(`${this.baseUrl}/slider`);
  }

  // --- CONSULTAS ---
  agendar(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/consulta`, dados, this.getHeaders());
  }

  getConsultas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/consulta`, this.getHeaders());
  }

  // Helper para enviar o Token JWT
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'x-access-token': token ? token : ''
      })
    };
  }

  // Foto de perfil
  uploadFotoPerfil(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', arquivo); // O nome 'foto' deve ser igual ao do backend (upload.single('foto'))

    return this.http.put(`${this.baseUrl}/usuario/foto`, formData, this.getHeaders());
  }

  // ATUALIZAR
  editarConsulta(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/consulta/${id}`, dados, this.getHeaders());
  }

  // DELETAR
  excluirConsulta(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/consulta/${id}`, this.getHeaders());
  }



  // --- FUNÇÕES DE ADMIN ---

  // Alterar status (Aprovar/Recusar)
  atualizarStatusConsulta(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/consulta/${id}/status`, { status }, this.getHeaders());
  }

  // Adicionar nova foto ao Slider
  uploadSlider(titulo: string, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('imagem', arquivo); // 'imagem' deve bater com o backend (upload.single('imagem'))

    return this.http.post(`${this.baseUrl}/slider`, formData, this.getHeaders());
  }

  // Remover foto do Slider
  deletarSlider(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/slider/${id}`, this.getHeaders());
  }



  // --- CHAT USUÁRIO ---
  enviarMensagemUser(texto: string) {
    return this.http.post(`${this.baseUrl}/chat/usuario`, { texto }, this.getHeaders());
  }
  
  getMensagensUser() {
    return this.http.get(`${this.baseUrl}/chat/usuario`, this.getHeaders());
  }

  // --- CHAT ADMIN ---
  getConversasAdmin() {
    return this.http.get(`${this.baseUrl}/chat/admin/conversas`, this.getHeaders());
  }
  
  getMensagensPorUsuario(idUsuario: number) {
    return this.http.get(`${this.baseUrl}/chat/admin/${idUsuario}`, this.getHeaders());
  }
  
  enviarMensagemAdmin(idUsuario: number, texto: string) {
    return this.http.post(`${this.baseUrl}/chat/admin/${idUsuario}`, { texto }, this.getHeaders());
  }
}