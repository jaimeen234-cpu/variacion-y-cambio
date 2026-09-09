import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio — Variación y Cambio',
    loadComponent: () => import('./ui/pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'laboratorio',
    title: 'Laboratorio — Variación y Cambio',
    loadComponent: () => import('./ui/pages/laboratorio/laboratorio').then((m) => m.Laboratorio),
  },
  {
    path: 'conceptos',
    title: 'Conceptos — Variación y Cambio',
    loadComponent: () => import('./ui/pages/conceptos/conceptos').then((m) => m.Conceptos),
  },
  {
    path: 'formulas',
    title: 'Fórmulas — Variación y Cambio',
    loadComponent: () => import('./ui/pages/formulas/formulas').then((m) => m.Formulas),
  },
  {
    path: 'cartilla',
    title: 'Cartilla — Variación y Cambio',
    loadComponent: () => import('./ui/pages/cartilla/cartilla').then((m) => m.Cartilla),
  },
  {
    path: '**',
    title: 'No Encontrado — Variación y Cambio',
    loadComponent: () => import('./ui/pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
];
