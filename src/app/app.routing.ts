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
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';

// ... MPI
import { DashboardComponent } from './components/paciente/dashboard.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { Auditoria2Component } from './components/auditoria/auditoria2.component';

// ... Obras sociales
import { PucoComponent } from './components/puco/puco.component';

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

// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';

// CONFIGURACION PRESTACION
import { ConfiguracionPrestacionVisualizarComponent } from './components/configuracionPrestacion/configuracion-prestacion-visualizar.component';

// Internacion
import { MapaDeCamasComponent } from './components/mapa-de-camas/mapa-de-camas/mapa-de-camas.component';
import { CamasListadoComponent } from './components/mapa-de-camas/cama/camasListado.component';
import { IniciarInternacionComponent } from './modules/rup/components/ejecucion/internacion/iniciarInternacion.component';
import { EjecucionInternacionComponent } from './modules/rup/components/ejecucion/internacion/ejecucionInternacion.component';
// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';
import { OcuparCamaComponent } from './modules/rup/components/ejecucion/internacion/ocuparCama.component';
import { CamaCreateUpdateComponent } from './components/mapa-de-camas/cama/cama-create-update.component';

// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ReglasComponent } from './components/top/reglas/reglas.component';

// Home de Estadisticas
// import { HomeComponent } from './modules/estadisticas/components/home.component';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';

// import { HomeComponent } from './modules/estadisticas/components/home.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'tm/organizacion', component: OrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/cama/:idCama', component: CamaCreateUpdateComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/:id/cama', component: CamasListadoComponent, canActivate: [RoutingGuard] },
  { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingGuard] },
  { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingGuard] },
  { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingGuard] },

  // MPI
  { path: 'mpi', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria', component: AuditoriaComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria2', component: Auditoria2Component, canActivate: [RoutingGuard] },
  { path: 'mpi', component: PacienteSearchComponent, canActivate: [RoutingGuard] },

  // Obras sociales
  { path: 'puco', component: PucoComponent, canActivate: [RoutingGuard] },

  // Turnos
  { path: 'citas', component: PuntoInicioTurnosComponent, canActivate: [RoutingGuard] },
  { path: 'citas/clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingGuard] },
  { path: 'citas/panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingGuard] },
  { path: 'citas/agendas', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/agenda', component: PlanificarAgendaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/turnos', component: DarTurnosComponent, canActivate: [RoutingGuard] },
  { path: 'citas/listaEspera', component: ListaEsperaComponent, canActivate: [RoutingGuard] },
  { path: 'citas/puntoInicio', component: PuntoInicioTurnosComponent, canActivate: [RoutingGuard] },

  // RUP
  { path: 'rup', component: PuntoInicioComponent, canActivate: [RoutingGuard] },
  { path: 'rup/crear/:opcion', component: PrestacionCrearComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/crear', component: IniciarInternacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/crear/:id', component: IniciarInternacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/ver/:id', component: EjecucionInternacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/ocuparCama/:idCama/:idInternacion', component: OcuparCamaComponent, canActivate: [RoutingGuard] },
  { path: 'rup/resumen/:id', component: ResumenComponent, canActivate: [RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/auditoriaRUP', component: AuditoriaPrestacionPacienteComponent, canActivate: [RoutingGuard] },
  { path: 'rup/llavesTipoPrestacion', component: LlavesTipoPrestacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/vista/:id', component: VistaHudsComponent, canActivate: [RoutingGuard] },
  { path: 'rup/buscaHuds', component: HudsBusquedaPacienteComponent, canActivate: [RoutingGuard] },

  // configuracion prestacion
  { path: 'configuracionPrestacion', component: ConfiguracionPrestacionVisualizarComponent, canActivate: [RoutingGuard] },

  // Mapa de camas
  { path: 'mapa-de-camas', component: MapaDeCamasComponent, canActivate: [RoutingGuard] },

  // Préstamos HC
  { path: 'prestamosHC', component: PrestamosHcComponent, canActivate: [RoutingGuard] },

  // Gestion de usuarios
  { path: 'gestionUsuarios', component: BusquedaUsuarioComponent, canActivate: [RoutingGuard] },

  // formulario terapeutico
  { path: 'formularioTerapeutico', component: FormTerapeuticoComponent, canActivate: [RoutingGuard] },

  // Reportes
  { path: 'reportes', component: EncabezadoReportesComponent, canActivate: [RoutingGuard] },
  { path: 'consultaDiagnostico', component: ConsultaDiagnosticoComponent, canActivate: [RoutingGuard] },
  { path: 'encabezadoReportes', component: EncabezadoReportesComponent, canActivate: [RoutingGuard] },
  { path: 'cantidadConsultaXPrestacion', component: CantidadConsultaXPrestacionComponent, canActivate: [RoutingGuard] },

  // Solicitudes
  { path: 'solicitudes', component: SolicitudesComponent, canActivate: [RoutingGuard] },

  // TOP
  { path: 'top/reglas', component: ReglasComponent, canActivate: [RoutingGuard] },


  // RUTAS LEGACY --- Deshabilitar una vez migradas al nuevo esquema rup/xxx , citas/xxx
  /* ELIMINAR ==> */ { path: 'pacientes', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'auditoria', component: AuditoriaComponent, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'auditoria2', component: Auditoria2Component, canActivate: [RoutingGuard] },
  /* ELIMINAR ==> */ { path: 'dashboard', component: DashboardComponent, canActivate: [RoutingGuard] },

  // TODO: Verificar si estas rutas todavía son válidas, y ubicarlas en los módulos correspondientes
  /* VERIFICAR ==> */ { path: 'tipoprestaciones', component: TipoPrestacionComponent, canActivate: [RoutingGuard] },

  // Principal
  { path: 'inicio', component: InicioComponent, canActivate: [RoutingGuard] },
  { path: 'selectOrganizacion', component: SelectOrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'login', component: LoginComponent },

  { path: 'estadisticas', loadChildren: './modules/estadisticas/estadistica.module#EstadisticaModule', canActivate: [RoutingGuard] },

  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
