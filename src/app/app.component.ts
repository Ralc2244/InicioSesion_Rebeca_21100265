import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, NavbarComponent],
  template: `
    <app-navbar *ngIf="mostrarNavbar"></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  mostrarNavbar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Oculta el navbar en estas rutas
        const rutasSinNavbar = [
          '/login', 
          '/register', 
          '/recuperar-contrasena',
          '/inventario'
        ];
        
        this.mostrarNavbar = !rutasSinNavbar.some(ruta => 
          event.url.startsWith(ruta)
        );
      }
    });
  }
}