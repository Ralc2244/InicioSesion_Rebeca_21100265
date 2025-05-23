import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent {
  email: string = '';
  errorMsg: string = '';
  successMsg: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  enviarEmail() {
    this.errorMsg = '';
    this.successMsg = '';
    if (!this.email) {
      this.errorMsg = 'Por favor ingresa un correo válido';
      return;
    }
    this.loading = true;
    // Llama al backend para enviar email de recuperación (simulado aquí)
    this.http.post<any>('http://localhost:3000/api/auth/recuperar-contrasena', { email: this.email }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.successMsg = 'Correo verificado';
          // Simula ir a la página para cambiar contraseña después de 3 seg
          setTimeout(() => this.router.navigate(['/cambiar-contrasena', this.email]), 3000);
        } else {
          this.errorMsg = res.message || 'Error enviando el correo';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error en el servidor';
      }
    });
  }
}
