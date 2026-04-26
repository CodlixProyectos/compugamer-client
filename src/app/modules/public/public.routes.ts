import { Routes } from '@angular/router';
import { dashboardAuthGuard } from './dashboard/infrastructure/driving-adapters/features/dashboard-auth.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [dashboardAuthGuard],
    loadComponent: () =>
      import('./dashboard/infrastructure/driving-adapters/features/dashboard').then(
        (module) => module.DashboardComponent
      )
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./cart/infrastructure/driving-adapters/features/cart').then(
        (module) => module.CartComponent
      )
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./product-detail/infrastructure/driving-adapters/features/product-detail').then(
        (module) => module.ProductDetailComponent
      )
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./catalog/infrastructure/driving-adapters/features/catalog').then(
        (module) => module.CatalogComponent
      )
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./home/infrastructure/driving-adapters/features/home').then(
        (module) => module.HomeComponent
      )
  }
];
