import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], // Añadir FormsModule
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda: string = '';

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
          this.productosFiltrados = [...this.productos];
        } 
        // Si la respuesta tiene un wrapper con propiedad 'data'
        else if (response.data && Array.isArray(response.data)) {
          this.productos = response.data;
          this.productosFiltrados = [...this.productos];
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

  filtrarProductos(): void {
    if (!this.terminoBusqueda) {
      this.productosFiltrados = [...this.productos];
      return;
    }
    
    this.productosFiltrados = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

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