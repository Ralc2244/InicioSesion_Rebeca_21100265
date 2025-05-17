import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];
  ivaPorcentaje = 0.16; // 16% de IVA

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
    this.cargarPayPal();
  }

  cargarPayPal(): void {
    if (this.carrito.length > 0) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AdF8qiECkFrIXtYJBzfWXyyvI2uHOp2T11yFMJjM7tcwu2wEx9B4sMpmqUse_0wFEhewG-6vSQr-iQsB&currency=MXN';
      script.onload = () => this.renderPayPalButton();
      document.body.appendChild(script);
    }
  }

  renderPayPalButton(): void {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return fetch('http://localhost:3000/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total: this.calcularTotal().toFixed(2),
            items: this.carrito
          })
        }).then((res: Response) => res.json()).then((order: any) => order.id);
      },
      onApprove: (data: any, actions: any) => {
        return fetch(`http://localhost:3000/api/paypal/capture-order/${data.orderID}`, {
          method: 'POST'
        })
        .then((res: Response) => res.json())
        .then((details: any) => {
          // 👉 Después del pago, actualizar stock en el backend
          this.actualizarStockProductos().then(() => {
            this.router.navigate(['/pago-completado']);
          });
        });
      }
    }).render('#paypal-button-container');
  }

  async actualizarStockProductos(): Promise<void> {
    try {
      await this.http.post('http://localhost:3000/api/productos/actualizar-stock', {
        productos: this.carrito
      }).toPromise();
    } catch (error) {
      console.error('Error al actualizar el stock:', error);
    }
  }

  aumentarCantidad(index: number): void {
    this.carritoService.aumentarCantidad(index);
    this.carrito = this.carritoService.obtenerCarrito();
    this.actualizarPayPal();
  }

  disminuirCantidad(index: number): void {
    this.carritoService.disminuirCantidad(index);
    this.carrito = this.carritoService.obtenerCarrito();
    this.actualizarPayPal();
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
    this.carrito = this.carritoService.obtenerCarrito();
    if (this.carrito.length === 0) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
    }
  }

  calcularSubtotal(): number {
    return this.carrito.reduce((total, producto) => {
      return total + (producto.precioP * (producto.cantidad || 1));
    }, 0);
  }

  calcularIVA(): number {
    return this.calcularSubtotal() * this.ivaPorcentaje;
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIVA();
  }

  private actualizarPayPal(): void {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
      this.cargarPayPal();
    }
  }
}