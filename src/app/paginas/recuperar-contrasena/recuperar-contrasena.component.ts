import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../components/environment/environment';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importaciones necesarias
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent {
  email: string = '';
  loading: boolean = false;
  emailSent: boolean = false; // Propiedad faltante
  errorMsg: string = ''; // Propiedad faltante

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm) { // Añade el parámetro form
    if (form.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    
    this.http.post(`${environment.apiUrl}/recuperar-contrasena.php`, { email: this.email })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.emailSent = true;
          } else {
            this.errorMsg = response.message || 'Ocurrió un error al enviar el correo';
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMsg = 'Error de conexión con el servidor';
          console.error('Error:', error);
        }
      });
  }
}