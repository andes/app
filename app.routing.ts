import { PacienteCreateComponent } from './components/paciente/paciente-create.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
  {
    path: 'organizacion',
    component: OrganizacionComponent
  },
  {
    path: 'profesional',
    component: ProfesionalComponent
  },
  {
    path: 'especialidad',
    component: EspecialidadComponent
  },
  {
    path: 'paciente',
    component: PacienteCreateComponent
  } 
];

export const routing = RouterModule.forRoot(appRoutes);