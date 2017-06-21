import { TestComponent } from './components/test.component';
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
import { MapsComponent } from './utils/mapsComponent';

// Componentes
// ... Tablas Maestras
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
// import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';

// ... Turnos
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';

// MPI
import { DashboardComponent } from './components/paciente/dashboard.component';

// ... RUP
import { ResumenComponent } from './components/rup/ejecucion/resumen.component';
import { PuntoInicioComponent } from './components/rup/ejecucion/puntoInicio.component';
import { ConsultaGeneralClinicaMedicaComponent } from './components/rup/moleculas/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
import { PrestacionEjecucionComponent } from './components/rup/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/rup/ejecucion/prestacionValidacion.component';
// import { SignosVitalesComponent } from './components/rup/signos-vitales/signosVitales.component';
// import { TensionArterialComponent } from './components/rup/tension-arterial/tensionArterial.component';

// ... Llaves
import { LlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/llaves-tipoPrestacion.component';
// Auditoria
import { AuditoriaPorBloqueComponent } from './components/auditoria/auditoriaPorBloque.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { Auditoria1Component } from './components/auditoria/auditoria1.component';
import { Auditoria2Component } from './components/auditoria/auditoria2.component';

// ... Auditoría RUP (prestacionPaciente)
import { AuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/auditoria-prestacionPaciente.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'organizacion', component: OrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'profesional', component: ProfesionalComponent, canActivate: [RoutingGuard] },
  { path: 'especialidad', component: EspecialidadComponent, canActivate: [RoutingGuard] },
  { path: 'pacientes', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  { path: 'espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingGuard] },
  { path: 'tipoprestaciones', component: TipoPrestacionComponent, canActivate: [RoutingGuard] },

  { path: 'dashboard', component: DashboardComponent, canActivate: [RoutingGuard] },

  // Turnos
  { path: 'clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingGuard] },
  { path: 'panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingGuard] },
  { path: 'agendas', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'agenda', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'turnos', component: DarTurnosComponent, canActivate: [RoutingGuard] },
  { path: 'listaEspera', component: ListaEsperaComponent, canActivate: [RoutingGuard] },

  // Auditoria
  { path: 'auditoria', component: AuditoriaComponent },
  { path: 'auditoria1', component: Auditoria1Component },
  { path: 'auditoria2', component: Auditoria2Component },
  { path: 'auditoriaPorBloque', component: AuditoriaPorBloqueComponent },

  // RUP
  // Prestación Clínica General de Medicina
  { path: 'test', component: TestComponent, canActivate: [RoutingGuard] },
  { path: 'rup', component: PuntoInicioComponent, canActivate: [RoutingGuard] },
  { path: 'rup/resumen/:id', component: ResumenComponent, canActivate: [RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingGuard] },
  // { path: 'tiposPrestaciones', component: TipoPrestacionComponent},

// Auditoría RUP (prestacionPaciente)
  { path: 'auditoriaRUP', component: AuditoriaPrestacionPacienteComponent, canActivate: [RoutingGuard] },

  // Llaves
  { path: 'llavesTipoPrestacion', component: LlavesTipoPrestacionComponent, canActivate: [RoutingGuard] },

  // Principal
  { path: 'inicio', component: InicioComponent, canActivate: [RoutingGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'logout', redirectTo: 'login', },
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
