import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: Producto[] = [];

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  // Agregar producto al carrito
  agregarProducto(producto: Producto): void {
    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = this.carrito.find((p) => p.id === producto.id);
    if (productoEnCarrito) {
      // Si el producto ya está, aumentar la cantidad
      productoEnCarrito.cantidad += 1;
    } else {
      // Si no está, agregarlo con cantidad 1
      this.carrito.push({ ...producto, cantidad: 1 });
    }

    // Guardar el carrito actualizado en el localStorage
    this.guardarCarrito();
  }

  eliminarProducto(index: number): void {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.guardarCarrito();
  }

  generarXML(): string {
    const itemsXML = this.carrito.map(producto => `
      <item>
        <nombre>${producto.nombre}</nombre>
        <precio>${producto.precioP}</precio>
        <cantidad>${producto.cantidad}</cantidad>
      </item>
    `).join('');

    return `
      <factura>
        <fecha>${new Date().toISOString()}</fecha>
        <items>
          ${itemsXML}
        </items>
        <total>${this.calcularTotal()}</total>
      </factura>
    `;
  }

  descargarXML(xml: string): void {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${new Date().getTime()}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private calcularTotal(): number {
    return this.carrito.reduce((total, producto) => {
      return total + (producto.precioP * producto.cantidad);
    }, 0);
  }

  private guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }
}
