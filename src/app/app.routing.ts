import { PlantillaComponent } from './components/turnos/plantilla.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico.component';
import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';
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
  { path: 'espacio_fisico', component: EspacioFisicoComponent},
  { path: 'prestacion', component: PrestacionComponent},
  { path: '**', redirectTo: "inicio" } 
];

// export const routing = RouterModule.forRoot(appRoutes);
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);