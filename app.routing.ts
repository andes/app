import { ProfesionalComponent } from './components/profesional/profesional.component';
import { EstablecimientoComponent } from './components/establecimiento/establecimiento.component';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
  {
    path: 'establecimiento',
    component: EstablecimientoComponent
  },
  {
    path: 'profesional',
    component: ProfesionalComponent
  }
 /* {
    path: '/especialidad',
    component: EspecialidadComponent
  } */
];

export const routing = RouterModule.forRoot(appRoutes);