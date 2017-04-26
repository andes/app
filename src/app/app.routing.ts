/*
@jgabriel | 04-03-2017

¡ATENCION EQUIPO!
Siguiendo las guías de estilo de Angular (https://angular.io/styleguide) dejemos ordenados los imports
de la siguiente manera:

1) Módulos principales de Angular
2) Módulos globales
3) Servicios
4) Componentes
5) Otros
*/

// Angular
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

// Global
import { RoutingGuard } from './app.routings-guard.class';
import {MapsComponent} from './utils/mapsComponent';

// Componentes
// ... Tablas Maestras
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
// import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';

// ... Turnos
import { AgendaComponent } from './components/turnos/agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { ClonarAgendaComponent } from './components/turnos/clonar-agenda';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas.component';

//MPI
import { DashboardComponent } from './components/paciente/dashboard.component';

// ... RUP
import { ResumenComponent } from './components/rup/ejecucion/resumen.component';
import { PuntoInicioComponent } from './components/rup/ejecucion/puntoInicio.component';
import { ConsultaGeneralClinicaMedicaComponent } from './components/rup/moleculas/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
// import { SignosVitalesComponent } from './components/rup/signos-vitales/signosVitales.component';
// import { TensionArterialComponent } from './components/rup/tension-arterial/tensionArterial.component';


const appRoutes: Routes = [
  // Tablas maestras
  { path: 'organizacion', component: OrganizacionComponent },
  { path: 'profesional', component: ProfesionalComponent },
  { path: 'especialidad', component: EspecialidadComponent },
  { path: 'pacientes', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  { path: 'espacio_fisico', component: EspacioFisicoComponent },
  { path: 'tipoprestaciones', component: TipoPrestacionComponent },

    { path: 'dashboard', component: DashboardComponent, canActivate: [RoutingGuard] },

  // Turnos
  { path: 'clonarAgenda', component: ClonarAgendaComponent },
  { path: 'gestor_agendas', component: GestorAgendasComponent },
  { path: 'panelEspacio', component: PanelEspacioComponent },
  { path: 'agendas', component: AgendaComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'turnos', component: DarTurnosComponent },
  { path: 'listaEspera', component: ListaEsperaComponent },

  // RUP
  { path: 'rup', component: PuntoInicioComponent },
  { path: 'rup/dashboard/:id', component: ResumenComponent },
  // { path: 'rup/:id?*/', component: DashboardComponent },
  // { path: 'prestacion', component: PrestacionComponent },
  // { path: 'atomos', component: PerinatalesGestacionMultipleComponent },

  // Login, etc.
  { path: 'inicio', component: InicioComponent },
  { path: '**', redirectTo: 'inicio' },


];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
