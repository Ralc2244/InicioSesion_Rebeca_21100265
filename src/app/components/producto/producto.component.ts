// producto.component.ts
import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (response) => {
        // Si la respuesta es directamente el array
        if (Array.isArray(response)) {
          this.productos = response;
        } 
        // Si la respuesta tiene un wrapper con propiedad 'data'
        else if (response.data && Array.isArray(response.data)) {
          this.productos = response.data;
        }
        // Si la estructura es diferente
        else {
          console.error('Estructura de respuesta inesperada:', response);
        }
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  // ... resto de tus métodos

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  irAlInventario(): void {
    this.router.navigate(['/inventario']); 
  }
}