import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pago-completado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-completado.component.html',
  styleUrls: ['./pago-completado.component.css']
})
export class PagoCompletadoComponent implements OnInit {
  carrito: Producto[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
  }

  descargarFactura(): void {
    const xml = this.carritoService.generarXML();
    this.carritoService.descargarXML(xml);
    this.carritoService.vaciarCarrito();
  }
}
