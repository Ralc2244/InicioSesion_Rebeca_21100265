import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './politicas.component.html',
  styleUrls: ['./politicas.component.css']
})
export class PoliticasComponent {
  aceptoPoliticas: boolean = false;
  mensajeConfirmacion: string = '';

  constructor(private router: Router) {}

  confirmarAceptacion(): void {
    // Aquí podrías guardar en localStorage o enviar al backend la aceptación
    localStorage.setItem('politicasAceptadas', 'true');
    this.mensajeConfirmacion = '¡Gracias por aceptar nuestras políticas!';
    
    setTimeout(() => {
      this.router.navigate(['/productos']);
    }, 2000);
  }
}