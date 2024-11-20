import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-barChart' }
  },
  {
    title: true,
    name: 'Pegatinas'
  },
  {
    name: 'Buscar',
    url: '/stickers/search',
    iconComponent: { name: 'cil-note-add' }
  },
  {
    name: 'Guardar',
    url: '/stickers/save',    
    iconComponent: { name: 'cil-pencil' }
  },
  {
    name: 'Etiquetas',
    title: true
  },
  {
    name: 'Buscar',
    url: '/tags/search',
    iconComponent: { name: 'cil-tag' }
  },
  {
    name: 'Guardar',
    url: '/tags/save',    
    iconComponent: { name: 'cil-pencil' }
  }
];
