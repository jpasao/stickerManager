import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Inicio'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'tags',
        loadChildren: () => import('./views/tag/routes').then((m) => m.routes)
      },
      {
        path: 'stickers',
        loadChildren: () => import('./views/sticker/routes').then((m) => m.routes)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
