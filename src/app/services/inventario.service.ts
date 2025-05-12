import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:3000/api/productos';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos
   */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<{success: boolean, data: Producto[]}>(this.apiUrl, { headers: this.headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un producto por su ID
   */
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<{success: boolean, data: Producto}>(`${this.apiUrl}/${id}`, { headers: this.headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Agrega un nuevo producto
   */
  agregarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<{success: boolean, data: Producto}>(this.apiUrl, producto, { headers: this.headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  modificarProducto(id: number, producto: Producto): Observable<Producto> {
  return this.http.put<{ success: boolean, data: Producto }>(`${this.apiUrl}/${id}`, producto, { headers: this.headers })
    .pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
}

  /**
   * Elimina un producto
   */
  eliminarProducto(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers })
    .pipe(
      catchError(err => {
        console.error('Error al eliminar producto:', err);
        // Agregar una validación para capturar los errores de tipo 404
        if (err.status === 404) {
          return throwError(() => new Error('Producto no encontrado.'));
        } else {
          return throwError(() => new Error('Error del servidor.'));
        }
      })
    );
}


  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Error del cliente:', error.error.message);
      return throwError(() => new Error('Error de comunicación con el servidor'));
    }
    
    console.error(`Código de error: ${error.status}, Mensaje: ${error.message}`);
    return throwError(() => new Error('Error del servidor'));
  }
}
