import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css' // Reutiliza o CSS do Login se quiser, ou crie um novo
})
export class CadastroComponent {
  api = inject(ApiService);
  router = inject(Router);
  msgErro: string = '';

  form = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  cadastrar() {
    if (this.form.invalid) return;

    this.api.cadastrar(this.form.value).subscribe({
      next: (resposta) => {
        alert('Conta criada com sucesso!');
        this.router.navigate(['/login']); // Manda para o login
      },
      error: (erro) => {
        console.error(erro);
        this.msgErro = 'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}