import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PagoCompletadoComponent } from './paginas/pago-completado/pago-completado.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecuperarContrasenaComponent } from './paginas/recuperar-contrasena/recuperar-contrasena.component';
import { CambiarContrasenaComponent } from './components/cambiar-contrasena/cambiar-contrasena.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },   // ahora la raíz muestra login
  { path: 'register', component: RegisterComponent },
  { path: 'productos', component: ProductoComponent }, // puedes poner productos en otra ruta
  { path: 'carrito', component: CarritoComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },
  { path: 'cambiar-contrasena/:email', component: CambiarContrasenaComponent },
  { path: 'pago-completado', component: PagoCompletadoComponent },
  { path: '**', redirectTo: '' } // redirección por defecto para rutas no válidas
];

export default routes;
