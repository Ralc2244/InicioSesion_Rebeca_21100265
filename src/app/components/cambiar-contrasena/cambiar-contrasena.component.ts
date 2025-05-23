import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.css']
})
export class CambiarContrasenaComponent {
  email: string = '';
  nuevaContrasena: string = '';
  confirmContrasena: string = '';
  errorMsg: string = '';
  successMsg: string = '';
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    const rawEmail = this.route.snapshot.params['email'] || '';
    this.email = decodeURIComponent(rawEmail);
  }

  cambiarContrasena() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.nuevaContrasena || this.nuevaContrasena.length < 4) {
      this.errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }

    if (this.nuevaContrasena !== this.confirmContrasena) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:3000/api/auth/cambiar-contrasena', {
      email: this.email,
      password: this.nuevaContrasena
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.successMsg = 'Contraseña cambiada con éxito. Redirigiendo al login...';
          setTimeout(() => this.router.navigate(['/']), 3000);
        } else {
          this.errorMsg = res.message || 'Error al cambiar la contraseña';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error en el servidor';
      }
    });
  }
}
