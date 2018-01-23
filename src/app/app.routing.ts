/*
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
import { CamaCreateUpdateComponent } from './components/organizacion/cama-create-update.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { SelectOrganizacionComponent } from './components/login/selectOrganizacion.component';

// ... CITAS
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { PuntoInicioTurnosComponent } from './components/turnos/dashboard/puntoInicio-turnos.component';

// ... MPI
import { DashboardComponent } from './components/paciente/dashboard.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { Auditoria2Component } from './components/auditoria/auditoria2.component';

// ... RUP
import { ResumenComponent } from './modules/rup/components/ejecucion/resumen.component';
import { PuntoInicioComponent } from './modules/rup/components/ejecucion/puntoInicio.component';
import { PrestacionEjecucionComponent } from './modules/rup/components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './modules/rup/components/ejecucion/prestacionValidacion.component';
import { PrestacionCrearComponent } from './modules/rup/components/ejecucion/prestacionCrear.component';
import { LlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/llaves-tipoPrestacion.component';
import { AuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/auditoria-prestacionPaciente.component';
import { VistaHudsComponent } from './modules/rup/components/ejecucion/vistaHuds.component';
import { HudsBusquedaPacienteComponent } from './modules/rup/components/ejecucion/hudsBusquedaPaciente.component';

// USUARIO
import { BusquedaUsuarioComponent } from './components/usuario/busquedaUsuario.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'tm/organizacion', component: OrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/:id/cama', component: CamaCreateUpdateComponent, canActivate: [RoutingGuard] },
  { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingGuard] },
  { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingGuard] },
  { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingGuard] },

  // MPI
  { path: 'mpi', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria', component: AuditoriaComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria2', component: Auditoria2Component, canActivate: [RoutingGuard] },
  // { path: 'mpi/auditoriaPorBloque', component: AuditoriaPorBloqueComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/dashboard', component: DashboardComponent, canActivate: [RoutingGuard] },

  // Turnos
  { path: 'citas', component: PuntoInicioTurnosComponent, canActivate: [RoutingGuard] },
  { path: 'citas/clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingGuard] },
  { path: 'citas/panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingGuard] },
  { path: 'citas/agendas', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/agenda', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/turnos', component: DarTurnosComponent, canActivate: [RoutingGuard] },
  { path: 'citas/listaEspera', component: ListaEsperaComponent, canActivate: [RoutingGuard] },

  // RUP
  { path: 'rup', component: PuntoInicioComponent, canActivate: [RoutingGuard] },
  { path: 'rup/crear', component: PrestacionCrearComponent, canActivate: [RoutingGuard] },
  { path: 'rup/resumen/:id', component: ResumenComponent, canActivate: [RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/auditoriaRUP', component: AuditoriaPrestacionPacienteComponent, canActivate: [RoutingGuard] },
  { path: 'rup/llavesTipoPrestacion', component: LlavesTipoPrestacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/vista/:id', component: VistaHudsComponent, canActivate: [RoutingGuard] },
  { path: 'rup/buscaHuds', component: HudsBusquedaPacienteComponent, canActivate: [RoutingGuard] },

  // Gestion de usuarios
  { path: 'gestionUsuarios', component: BusquedaUsuarioComponent, canActivate: [RoutingGuard] },


  // RUTAS LEGACY --- Deshabilitar una vez migradas al nuevo esquema rup/xxx , citas/xxx
  /* ELIMINAR ==> */ { path: 'pacientes', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'agendas', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'agenda', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'turnos', component: DarTurnosComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'listaEspera', component: ListaEsperaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'puntoInicioTurnos', component: PuntoInicioTurnosComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'auditoria', component: AuditoriaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'auditoria2', component: Auditoria2Component, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'dashboard', component: DashboardComponent, canActivate: [RoutingGuard] },

  // TODO: Verificar si estas rutas todavía son válidas, y ubicarlas en los módulos correspondientes
  /* VERIFICAR ==> */ { path: 'tipoprestaciones', component: TipoPrestacionComponent, canActivate: [RoutingGuard] },


  // Principal
  { path: 'inicio', component: InicioComponent, canActivate: [RoutingGuard] },
  { path: 'selectOrganizacion', component: SelectOrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
