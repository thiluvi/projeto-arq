import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // <--- DatePipe importado aqui
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  providers: [DatePipe], // <--- ESSA LINHA É CRUCIAL PARA CORRIGIR A TELA BRANCA
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  api = inject(ApiService);
  datePipe = inject(DatePipe); // <--- Injeção para usar na lógica de edição
  
  // Dados do usuário e consultas
  usuario: any = {}; 
  urlFotoPerfil: string = 'assets/icons/user-placeholder.png'; // Caminho de foto padrão
  consultas: any[] = [];
  
  // Controle de Edição e Mensagens
  idEdicao: number | null = null;
  msgSucesso: string = '';
  msgErro: string = '';

  // Formulário
  form = new FormGroup({
    data: new FormControl('', [Validators.required]),
    observacao: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    this.carregarUsuario();
    this.carregarConsultas();
  }

  carregarUsuario() {
    const dadosStorage = localStorage.getItem('usuario');
    if (dadosStorage) {
      this.usuario = JSON.parse(dadosStorage);
      if (this.usuario.foto_perfil) {
        // Corrige barras invertidas do Windows se houver
        this.urlFotoPerfil = `http://localhost:5010/${this.usuario.foto_perfil.replace(/\\/g, '/')}`;
      }
    }
  }

  carregarConsultas() {
    this.api.getConsultas().subscribe({
      next: (dados: any) => {
        this.consultas = dados;
      },
      error: (erro) => console.error('Erro ao buscar consultas', erro)
    });
  }

  // Lógica de Upload de Foto
  onFileSelected(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      this.api.uploadFotoPerfil(arquivo).subscribe({
        next: (resp: any) => {
          this.urlFotoPerfil = `http://localhost:5010/${resp.novoCaminho.replace(/\\/g, '/')}`;
          this.usuario.foto_perfil = resp.novoCaminho;
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
          alert('Foto atualizada!');
        },
        error: () => alert('Erro ao enviar foto.')
      });
    }
  }

  // Lógica de Salvar (Criar ou Editar)
  salvar() {
    if (this.form.invalid) return;

    const dadosEnvio = { ...this.form.value };

    // CORREÇÃO CRUCIAL: Remove o 'T' e garante segundos :00
    // Exemplo: De "2025-11-27T14:30" vira "2025-11-27 14:30:00"
    if (dadosEnvio.data) {
      dadosEnvio.data = dadosEnvio.data.replace('T', ' ');
      if (dadosEnvio.data.length === 16) {
         dadosEnvio.data += ':00'; 
      }
    }

    // console.log('Enviando para API:', dadosEnvio); // <--- Descomente para ver no F12

    if (this.idEdicao) {
      this.api.editarConsulta(this.idEdicao, dadosEnvio).subscribe({
        next: () => {
          this.msgSucesso = 'Consulta atualizada com sucesso!';
          this.finalizarAcao();
        },
        error: (erro) => {
          console.error(erro);
          this.msgErro = 'Erro ao atualizar (Verifique o console).';
        }
      });
    } else {
        // ... lógica de criar nova ...
        this.api.agendar(dadosEnvio).subscribe({
            next: () => {
                this.msgSucesso = 'Criado com sucesso!';
                this.finalizarAcao();
            },
            error: () => this.msgErro = 'Erro ao criar.'
        });
    }
  }

  // Prepara o formulário com os dados existentes
  prepararEdicao(consulta: any) {
    this.idEdicao = consulta.id;
    
    // Transforma a data para o formato aceito pelo input HTML (yyyy-MM-ddTHH:mm)
    const dataFormatada = this.datePipe.transform(consulta.data_consulta, 'yyyy-MM-ddTHH:mm');

    this.form.patchValue({
      data: dataFormatada,
      observacao: consulta.observacao
    });
    
    // Rola até o formulário
    document.querySelector('.secao-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  excluir(id: number) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      this.api.excluirConsulta(id).subscribe({
        next: () => {
          alert('Agendamento cancelado.');
          this.carregarConsultas();
        },
        error: () => alert('Erro ao excluir.')
      });
    }
  }

  cancelarEdicao() {
    this.idEdicao = null;
    this.form.reset();
    this.msgSucesso = '';
    this.msgErro = '';
  }

  finalizarAcao() {
    this.carregarConsultas();
    this.cancelarEdicao();
    setTimeout(() => this.msgSucesso = '', 3000);
  }

  // Auxiliar de CSS
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmada': return 'status-verde';
      case 'pendente': return 'status-laranja';
      case 'cancelada': return 'status-vermelho';
      default: return '';
    }
  }
}