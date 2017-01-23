
import { AgendaComponent } from './components/turnos/agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';

import { ClonarAgendaComponent } from './components/turnos/clonar-agenda';

import { GestorAgendasComponent } from './components/turnos/gestor-agendas.component';

import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';
import { PacienteComponent } from './components/paciente/paciente.component';
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
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
  { path: 'paciente', component: PacienteComponent },
  { path: 'agendas', component: AgendaComponent },
  { path: 'pacienteSearch', component: PacienteSearchComponent },
  { path: 'espacio_fisico', component: EspacioFisicoComponent },
  { path: 'prestacion', component: PrestacionComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'turnos', component: DarTurnosComponent },
  { path: 'clonarAgenda', component: ClonarAgendaComponent },
  { path: 'gestor_agendas', component: GestorAgendasComponent },
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);