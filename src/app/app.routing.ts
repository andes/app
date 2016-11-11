import { PlantillaComponent } from './components/turnos/plantilla.component';
import { PacienteComponent } from './components/paciente/paciente.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

const appRoutes: Routes = [
  { path: 'organizacion', component: OrganizacionComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'profesional', component: ProfesionalComponent },
  { path: 'especialidad', component: EspecialidadComponent },
  { path: 'paciente', component: PacienteComponent},
  { path: 'plantillas', component: PlantillaComponent},
  { path: '**', redirectTo: "inicio" } 
];

// export const routing = RouterModule.forRoot(appRoutes);
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);