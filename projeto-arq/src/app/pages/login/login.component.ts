import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Importe ReactiveFormsModule
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  api = inject(ApiService);
  router = inject(Router);
  msgErro: string = '';

  // Configuração do Formulário
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required])
  });

  entrar() {
    if (this.form.invalid) return;

    this.api.login(this.form.value).subscribe({
      next: (dados: any) => {
        // 1. Salva o Token e os dados do Usuário
        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        // 2. Redireciona dependendo do perfil
        if (dados.usuario.role === 'admin') {
          this.router.navigate(['/painel-admin']);
        } else {
          this.router.navigate(['/painel-usuario']);
        }
      },
      error: (erro) => {
        this.msgErro = 'E-mail ou senha inválidos.';
      }
    });
  }
}