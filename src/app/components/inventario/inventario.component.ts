import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { Producto } from '../../models/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  nuevoProducto: Producto = this.crearProductoVacio();
  productoSeleccionado: Producto | null = null;

  // Notificaciones
  mostrarNotificacion: boolean = false;
  mensajeNotificacion: string = '';
  tipoNotificacion: 'success' | 'error' = 'success';

  // Estado de carga
  cargando: boolean = false;

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  // Método para crear un producto vacío
  private crearProductoVacio(): Producto {
    return {
      id: 0,
      nombre: '',
      precioP: 0,
      imagen: '',
      cantidad: 0
    };
  }

  // Cargar lista de productos
  cargarProductos(): void {
    this.cargando = true;
    this.inventarioService.obtenerProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarNotificacionTemporal(
          err.message || 'Error al cargar productos',
          'error'
        );
        this.cargando = false;
      }
    });
  }

  // Agregar nuevo producto
  agregarProducto(): void {
    if (!this.validarProducto(this.nuevoProducto)) {
      this.mostrarNotificacionTemporal('Complete todos los campos correctamente', 'error');
      return;
    }

    this.cargando = true;
    this.inventarioService.agregarProducto(this.nuevoProducto).subscribe({
      next: (producto: Producto) => {
        this.mostrarNotificacionTemporal('Producto agregado correctamente', 'success');
        this.nuevoProducto = this.crearProductoVacio();
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al agregar producto:', err);
        this.mostrarNotificacionTemporal(
          err.message || 'Error al agregar producto',
          'error'
        );
        this.cargando = false;
      }
    });
  }

  // Seleccionar producto para edición
  editarProducto(producto: Producto): void {
    this.productoSeleccionado = { ...producto };  // Creamos una copia del producto para editar
  }

  // Guardar cambios de edición
  guardarCambios(): void {
    if (this.productoSeleccionado && this.validarProducto(this.productoSeleccionado)) {
      this.cargando = true;
      this.inventarioService.modificarProducto(
        this.productoSeleccionado.id,
        this.productoSeleccionado
      ).subscribe({
        next: () => {
          this.mostrarNotificacionTemporal('Producto actualizado correctamente', 'success');
          this.productoSeleccionado = null;
          this.cargarProductos();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          this.mostrarNotificacionTemporal(
            err.message || 'Error al actualizar producto',
            'error'
          );
          this.cargando = false;
        }
      });
    }
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.productoSeleccionado = null;
  }

  // Eliminar producto
  eliminarProducto(id: number): void {
  this.inventarioService.eliminarProducto(id).subscribe({
    next: () => {
      this.mostrarNotificacionTemporal('Producto eliminado correctamente', 'success');
      this.cargarProductos(); // Recargar productos después de eliminar uno
    },
    error: (err) => {
      console.error('Error al eliminar producto:', err);  // Agregar detalles de la respuesta de error
      this.mostrarNotificacionTemporal(err.message || 'Error al eliminar producto', 'error');
      this.cargando = false;
    }
  });
}


  // Mostrar notificación temporal
  private mostrarNotificacionTemporal(
    mensaje: string,
    tipo: 'success' | 'error' = 'success'
  ): void {
    this.mensajeNotificacion = mensaje;
    this.tipoNotificacion = tipo;
    this.mostrarNotificacion = true;

    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }

  // Validar datos del producto
  private validarProducto(producto: Producto): boolean {
    return !!producto.nombre?.trim() && 
           !isNaN(producto.precioP) && producto.precioP >= 0 &&
           !!producto.imagen?.trim() && 
           !isNaN(producto.cantidad) && producto.cantidad >= 0;
  }
}
