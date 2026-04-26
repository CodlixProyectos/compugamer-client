import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/public/public.routes').then((module) => module.PUBLIC_ROUTES)
  }
];

