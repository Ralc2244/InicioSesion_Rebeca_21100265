import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PagoCompletadoComponent } from './paginas/pago-completado/pago-completado.component';

export const routes: Routes = [
  { path: '', component: ProductoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'pago-completado', component: PagoCompletadoComponent },
  { path: '**', redirectTo: '' } // redirección por defecto para rutas no válidas
];

export default routes;
