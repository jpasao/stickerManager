import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Pegatinas'
    },
    children: [
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search.component').then(m => m.SearchComponent),
        data: {
          title: 'Buscar'
        }
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery.component').then(m => m.GalleryComponent),
        data: {
          title: 'Galería'
        }
      },
      {
        path: 'save',
        loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
        data: {
          title: 'Guardar'
        }
      },
    ]
  }
];