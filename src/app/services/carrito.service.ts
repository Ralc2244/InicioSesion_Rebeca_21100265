import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { InventarioService } from './inventario.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: Producto[] = [];
  private productosSubject = new BehaviorSubject<Producto[]>([]);

  constructor(private inventarioService: InventarioService) {
    this.cargarDesdeLocalStorage(); // ✅ cargar carrito al iniciar
  }

  agregarProducto(producto: Producto): void {
    const productoEnCarrito = this.carrito.find((p) => p.id === producto.id);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad += 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.actualizarCarrito();
  }

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): boolean {
    const productoEnCarrito = this.carrito.find((p) => p.id === productoId);
    if (productoEnCarrito) {
      const productoEnInventario = this.inventarioService.obtenerProductoPorId(productoId);
      if (productoEnInventario && nuevaCantidad <= productoEnInventario.cantidad && nuevaCantidad > 0) {
        productoEnCarrito.cantidad = nuevaCantidad;
        this.actualizarCarrito();
        return true;
      }
    }
    return false;
  }

  eliminarProducto(index: number): void {
    this.carrito.splice(index, 1);
    this.actualizarCarrito();
  }

  obtenerCarritoObservable() {
    return this.productosSubject.asObservable();
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.carrito.find((p) => p.id === id);
  }

  vaciarCarrito(): void {
    this.carrito = [];
    localStorage.removeItem('carrito');
    this.productosSubject.next(this.carrito);
  }

  generarXML(): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <Factura>\n`;
    xml += `    <Encabezado>\n`;
    xml += `      <Emisor>\n`;
    xml += `        <Nombre>CETRIONIC digital</Nombre>\n`;
    xml += `        <RFC>21300652</RFC>\n`;
    xml += `        <Domicilio>Ceti Colomos #12</Domicilio>\n`;
    xml += `      </Emisor>\n`;
    xml += `      <Receptor>\n`;
    xml += `        <Nombre>Paola Ponce</Nombre>\n`;
    xml += `      </Receptor>\n`;
    xml += `      <Fecha>${new Date().toISOString().split('T')[0]}</Fecha>\n`;
    xml += `      <NumFactura>${Math.floor(Math.random() * 100000000)}</NumFactura>\n`;
    xml += `    </Encabezado>\n`;
    xml += `    <Detalles>\n`;

    this.carrito.forEach((producto) => {
      xml += `        <producto>\n`;
      xml += `          <id>${producto.id}</id>\n`;
      xml += `          <nombre>${producto.nombre}</nombre>\n`;
      xml += `          <precio>${producto.precioP}</precio>\n`;
      xml += `          <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `        </producto>\n`;
    });

    xml += `    </Detalles>\n`;

    let subtotal = this.carrito.reduce((sum, producto) => sum + Number(producto.precioP) * producto.cantidad, 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;

    xml += `    <Totales>\n`;
    xml += `      <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `      <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `      <total>${total.toFixed(2)}</total>\n`;
    xml += `    </Totales>\n`;
    xml += `  </Factura>\n`;
    xml += `</recibo>`;

    return xml;
  }

  descargarXML(xml: string): void {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 🔁 Métodos para localStorage
  private guardarEnLocalStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  private cargarDesdeLocalStorage(): void {
    const data = localStorage.getItem('carrito');
    if (data) {
      this.carrito = JSON.parse(data);
      this.productosSubject.next(this.carrito);
    }
  }

  private actualizarCarrito(): void {
    this.guardarEnLocalStorage();
    this.productosSubject.next(this.carrito);
  }
}
