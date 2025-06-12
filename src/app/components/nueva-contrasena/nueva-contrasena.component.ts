import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-nueva-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importaciones necesarias
  templateUrl: './nueva-contrasena.component.html',
  styleUrls: ['./nueva-contrasena.component.css']
})
export class NuevaContrasenaComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  validToken: boolean = false;
  loading: boolean = false;
  success: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (this.token) {
      this.validateToken();
    }
  }

  validateToken() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/nueva-contrasena.php?token=${this.token}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.validToken = res.valid;
          if (!res.valid) {
            this.error = 'Enlace inválido o expirado';
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'Error de conexión con el servidor';
        }
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.password !== this.confirmPassword) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/nueva-contrasena.php`, {
      token: this.token,
      password: this.password
    }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: () => {
        this.error = 'Error al actualizar la contraseña';
        this.loading = false;
      }
    });
  }
}