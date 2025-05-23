import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  rol = 'cliente';
  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.nombre || !this.email || !this.password) {
      this.errorMsg = 'Por favor llena todos los campos';
      return;
    }

    if (this.password.length < 4) {
      this.errorMsg = 'La contraseña debe tener al menos 4 caracteres';
      return;
    }

    if (!this.rol) {
      this.errorMsg = 'Por favor selecciona un tipo de usuario';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:3000/api/auth/register', {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMsg = 'Registro exitoso. Puedes iniciar sesión.';
          setTimeout(() => this.router.navigate(['/']), 2000);
        } else {
          this.errorMsg = res.message || 'Error al registrar usuario';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error en el servidor';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/']);
  }
}
