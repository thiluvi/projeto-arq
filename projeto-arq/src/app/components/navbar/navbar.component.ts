import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // <--- Importe o CommonModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule], // <--- Adicione CommonModule aqui
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  api = inject(ApiService);
  usuario: any = null;

  ngOnInit() {
    // Fica "escutando": se o usuário mudar (login ou logout), atualiza a variável
    this.api.usuario$.subscribe(u => {
      this.usuario = u;
    });
  }

  sair() {
    this.api.logout();
  }
}