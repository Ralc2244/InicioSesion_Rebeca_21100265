import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


declare var paypal: any;

@Component({
  selector: 'app-carrito',
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];
  mostrarBotonPayPal = false;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
    this.cargarPayPal();
  }

  cargarPayPal(): void {
    if (this.carrito.length > 0) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AdF8qiECkFrIXtYJBzfWXyyvI2uHOp2T11yFMJjM7tcwu2wEx9B4sMpmqUse_0wFEhewG-6vSQr-iQsB&currency=MXN`;
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
        }).then(res => res.json()).then(order => order.id);
      },
      onApprove: (data: any, actions: any) => {
        return fetch(`http://localhost:3000/api/paypal/capture-order/${data.orderID}`, {
          method: 'POST'
        }).then(res => res.json()).then(details => {
          this.router.navigate(['/pago-completado']);
        });
      }
    }).render('#paypal-button-container');
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
    this.carrito = this.carritoService.obtenerCarrito();
    if (this.carrito.length === 0) {
      document.getElementById('paypal-button-container')!.innerHTML = '';
    }
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, producto) => {
      return total + (producto.precioP * producto.cantidad);
    }, 0);
  }
}