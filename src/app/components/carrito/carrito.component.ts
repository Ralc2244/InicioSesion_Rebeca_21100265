import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
  }

  actualizarCantidad(productoId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevaCantidad = parseInt(input.value, 10);

    if (this.carritoService.actualizarCantidad(productoId, nuevaCantidad)) {
      console.log('Cantidad actualizada');
    } else {
      const producto = this.carrito.find((p) => p.id === productoId);
      if (producto) {
        input.value = producto.cantidad.toString();
      }
      alert('No hay suficiente stock o la cantidad no es válida.');
    }
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, producto) => {
      return total + (producto.precioP * producto.cantidad);
    }, 0);
  }

  continuarPago(): void {
    const total = this.calcularTotal();
    fetch('http://localhost:3000/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ total })
    })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        window.location.href = data.url; // Redirige a PayPal
      } else {
        alert('Carrito vacío.');
        console.error('Respuesta inesperada:', data);
      }
    })
    .catch(err => {
      console.error('Error al crear la orden de pago:', err);
      alert('Hubo un error al intentar procesar el pago.');
    });
  }
}
