import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
  hora: Date;
}

interface Pregunta {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  mensajes: Mensaje[] = [];
  preguntaSeleccionada: string = '';
  
  preguntas: Pregunta[] = [
    {
      pregunta: '¿Cuáles son los métodos de pago aceptados?',
      respuesta: 'Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), transferencias bancarias y PayPal.'
    },
    {
      pregunta: '¿Cuál es el tiempo de entrega?',
      respuesta: 'El tiempo de entrega varía según tu ubicación. Generalmente es de 3-5 días hábiles para áreas urbanas y 5-7 para zonas rurales.'
    },
    {
      pregunta: '¿Ofrecen garantía en los productos?',
      respuesta: 'Sí, todos nuestros productos tienen una garantía de 1 año contra defectos de fabricación.'
    },
    {
      pregunta: '¿Cómo puedo realizar un cambio o devolución?',
      respuesta: 'Puedes iniciar un proceso de cambio o devolución dentro de los 15 días posteriores a la recepción del producto. Contáctanos a través de este chat para ayudarte.'
    }
  ];

  enviarPregunta(): void {
    if (!this.preguntaSeleccionada) return;
    
    // Agregar pregunta del usuario
    this.mensajes.push({
      texto: this.preguntaSeleccionada,
      esUsuario: true,
      hora: new Date()
    });
    
    // Buscar y agregar respuesta
    const pregunta = this.preguntas.find(p => p.pregunta === this.preguntaSeleccionada);
    if (pregunta) {
      setTimeout(() => {
        this.mensajes.push({
          texto: pregunta.respuesta,
          esUsuario: false,
          hora: new Date()
        });
      }, 500);
    }
    
    this.preguntaSeleccionada = '';
  }

  seleccionarPreguntaRapida(pregunta: string): void {
    this.preguntaSeleccionada = pregunta;
    this.enviarPregunta();
  }
}