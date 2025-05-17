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
      productoEnCarrito.cantidad = (productoEnCarrito.cantidad || 1) + 1;
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

  generarXML(productos: Producto[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n';
  xml += '  <Factura>\n';
  xml += '    <Encabezado>\n';
  xml += '      <Emisor>\n';
  xml += '        <Nombre>CETRIONIC digital</Nombre>\n';
  xml += '        <RFC>21300652</RFC>\n';
  xml += '        <Domicilio>Ceti Colomos #12</Domicilio>\n';
  xml += '      </Emisor>\n';
  xml += '      <Receptor>\n';
  xml += '        <Nombre>Paola Ponce</Nombre>\n';
  xml += '      </Receptor>\n';
  xml += `      <Fecha>${new Date().toISOString().split('T')[0]}</Fecha>\n`;
  xml += '      <NumFactura>19011901</NumFactura>\n';
  xml += '    </Encabezado>\n';
  xml += '    <Detalles>\n';

  productos.forEach((producto) => {
    xml += '      <producto>\n';
    xml += `        <id>${producto.id}</id>\n`;
    xml += `        <nombre>${producto.nombre}</nombre>\n`;
    xml += `        <precio>${producto.precioP}</precio>\n`;
    xml += `        <cantidad>${producto.cantidad}</cantidad>\n`;
    xml += '      </producto>\n';
  });

  xml += '    </Detalles>\n';

  const subtotal = productos.reduce((sum, producto) => sum + Number(producto.precioP) * (producto.cantidad || 1), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  xml += '    <Totales>\n';
  xml += `      <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
  xml += `      <iva>${iva.toFixed(2)}</iva>\n`;
  xml += `      <total>${total.toFixed(2)}</total>\n`;
  xml += '    </Totales>\n';

  xml += '  </Factura>\n';
  xml += '</recibo>';

  return xml;
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

  private guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  aumentarCantidad(index: number): void {
    if (this.carrito[index]) {
      this.carrito[index].cantidad = (this.carrito[index].cantidad || 1) + 1;
      this.guardarCarrito();
    }
  }

  disminuirCantidad(index: number): void {
    if (this.carrito[index] && (this.carrito[index].cantidad || 1) > 1) {
      this.carrito[index].cantidad = (this.carrito[index].cantidad || 1) - 1;
      this.guardarCarrito();
    }
  }
}