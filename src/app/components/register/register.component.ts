import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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

  // Propiedades para validación de contraseña
  hasLowercase = false;
  hasUppercase = false;
  hasNumber = false;
  passwordValid = false;

  constructor(private http: HttpClient, private router: Router) {}

  // Método para verificar fortaleza de contraseña en tiempo real
  checkPasswordStrength() {
    this.hasLowercase = /[a-z]/.test(this.password);
    this.hasUppercase = /[A-Z]/.test(this.password);
    this.hasNumber = /\d/.test(this.password);
    this.passwordValid = this.hasLowercase && this.hasUppercase && this.hasNumber && this.password.length >= 4;
  }

  // Validación del formulario
  validateForm(): boolean {
    if (!this.nombre || !this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return false;
    }

    this.checkPasswordStrength();
    if (!this.passwordValid) {
      this.errorMsg = 'La contraseña no cumple con los requisitos';
      return false;
    }

    if (!this.rol) {
      this.errorMsg = 'Por favor selecciona un tipo de usuario';
      return false;
    }

    return true;
  }

  // Envío del formulario
  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const userData = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol
    };

    this.http.post<any>('http://localhost:3000/api/auth/register', userData)
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.successMsg = 'Registro exitoso. Redirigiendo...';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else {
            this.errorMsg = res.message || 'Error al registrar usuario';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Error en el servidor. Por favor intenta nuevamente.';
          console.error('Error en el registro:', err);
        }
      });
  }

  // Navegación a login
  irALogin() {
    this.router.navigate(['/login']);
  }
}