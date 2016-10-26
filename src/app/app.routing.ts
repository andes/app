import { PacienteComponent } from './components/paciente/paciente.component';
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
    path: 'pacientes',
    component: PacienteComponent
  },
  {
    path: '**',
    redirectTo: "organizacion"
  } 
];

export const routing = RouterModule.forRoot(appRoutes);