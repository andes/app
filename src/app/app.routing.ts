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
import { RoutingGuard, RoutingNavBar } from './app.routings-guard.class';

// Componentes

// ... Tablas Maestras
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { SelectOrganizacionComponent } from './components/login/selectOrganizacion.component';
import { OrganizacionSectoresComponent } from './components/organizacion/organizacion-sectores.component';

// ... CITAS
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';

// ... MPI
import { DashboardComponent } from './components/paciente/dashboard.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { ExtranjeroNNCruComponent } from './core/mpi/components/extranjero-nn-cru.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { PacienteCruComponent } from './core/mpi/components/paciente-cru.component';
import { BebeCruComponent } from './core/mpi/components/bebe-cru.component';

// ... Obras sociales
import { PucoComponent } from './components/puco/puco.component';

// ... RUP
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
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';

// REPORTES SJ
import { EncabezadoReportesDiariosComponent } from './components/reportesDiarios/encabezadoReportesDiarios.component';

// CONFIGURACIONES
import { ConfiguracionPrestacionVisualizarComponent } from './components/configuracionPrestacion/configuracion-prestacion-visualizar.component';
import { PlantillasRUPComponent } from './apps/rup/plantillas-rup/plantillas-rup.component';

// Internacion
import { MapaDeCamasComponent } from './apps/rup/internacion/components/mapa-de-camas.component';
import { ListadoInternacionComponent } from './apps/rup/internacion/components/listado-internacion.component';

// Solicitudes
import { CensoDiarioComponent } from './apps/rup/internacion/components/censoDiario.component';
import { CensoMensualComponent } from './apps/rup/internacion/components/censoMensual.component';
import { CamaCreateUpdateComponent } from './apps/rup/internacion/components/cama-create-update.component';
import { IniciarInternacionComponent } from './apps/rup/internacion/components/iniciarInternacion.component';
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';
// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';
import { OcuparCamaComponent } from './apps/rup/internacion/components/cama-ocupar.component';
// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ReglasComponent } from './components/top/reglas/reglas.component';
import { VisualizacionReglasComponent } from './components/top/reglas/visualizacionReglas.component';

// Home de Estadisticas
// import { HomeComponent } from './modules/estadisticas/components/home.component';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { VincularPacientesComponent } from './components/auditoria/vincular-pacientes.component';


// import { HomeComponent } from './modules/estadisticas/components/home.component';

// Campañas salud
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
// Buscador de turnos y prestaciones
import { TurnosPrestacionesComponent } from './components/buscadorTurnosPrestaciones/turnos-prestaciones.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'tm/organizacion', component: OrganizacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/organizacion/:id/sectores', component: OrganizacionSectoresComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/organizacion/cama/:idCama', component: CamaCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/organizacion/cama', component: CamaCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/profesional/create', component: ProfesionalCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/mapa_espacio_fisico', component: MapaEspacioFisicoVistaComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // MPI
  { path: 'apps/mpi/busqueda', component: BusquedaMpiComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/bebe', component: BebeCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/paciente', component: PacienteCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/extranjero', component: ExtranjeroNNCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/bebe/:origen', component: BebeCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/extranjero/:origen', component: ExtranjeroNNCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/paciente/:opcion/:origen', component: PacienteCruComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/auditoria/vincular-pacientes', component: VincularPacientesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'apps/mpi/auditoria', component: AuditoriaComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Obras sociales
  { path: 'puco', component: PucoComponent, canActivate: [RoutingNavBar] },

  // Turnos
  { path: 'citas', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/agendas', component: PlanificarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/agenda', component: PlanificarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/turnos', component: DarTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/listaEspera', component: ListaEsperaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/punto-inicio', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/punto-inicio/:idPaciente', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // RUP
  { path: 'rup', component: PuntoInicioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/crear/:opcion', component: PrestacionCrearComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/crear', component: IniciarInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/crear/:id', component: IniciarInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/ocuparCama/:idCama/:idInternacion', component: OcuparCamaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/auditoriaRUP', component: AuditoriaPrestacionPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/llavesTipoPrestacion', component: LlavesTipoPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/vista/:id', component: VistaHudsComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/huds/paciente/:id', component: VistaHudsComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/huds', component: HudsBusquedaPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/censo', component: CensoDiarioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/censo/mensual', component: CensoMensualComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/internacion/listado', component: ListadoInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  { path: 'rup/plantillas', component: PlantillasRUPComponent, canActivate: [RoutingNavBar, RoutingGuard] },


  // Configuraciones / ABM
  { path: 'configuracionPrestacion', component: ConfiguracionPrestacionVisualizarComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Mapa de camas
  { path: 'internacion/camas', component: MapaDeCamasComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'internacion/inicio', component: PuntoInicioInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Préstamos HC
  { path: 'prestamosHC', component: PrestamosHcComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Gestion de usuarios
  { path: 'gestionUsuarios', component: BusquedaUsuarioComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // formulario terapeutico
  { path: 'formularioTerapeutico', component: FormTerapeuticoComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Reportes
  { path: 'reportes', component: EncabezadoReportesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'consultaDiagnostico', component: ConsultaDiagnosticoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'encabezadoReportes', component: EncabezadoReportesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'cantidadConsultaXPrestacion', component: CantidadConsultaXPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // ReportesDiarios
  { path: 'reportesDiarios', component: EncabezadoReportesDiariosComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Solicitudes
  { path: 'solicitudes', component: SolicitudesComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Buscador de turnos y prestaciones
  { path: 'buscador', component: TurnosPrestacionesComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // TOP
  { path: 'top/reglas', component: ReglasComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'top/reglasVisualizacion', component: VisualizacionReglasComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // TODO: Verificar si estas rutas todavía son válidas, y ubicarlas en los módulos correspondientes
  /* VERIFICAR ==> */ { path: 'tipoprestaciones', component: TipoPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Principal
  { path: 'inicio', component: InicioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'selectOrganizacion', component: SelectOrganizacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'login', component: LoginComponent, canActivate: [RoutingNavBar] },

  { path: 'estadisticas', loadChildren: './modules/estadisticas/estadistica.module#EstadisticaModule', canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'dashboard', loadChildren: './modules/estadisticas/estadistica.module#EstadisticaModule', canActivate: [RoutingNavBar, RoutingGuard] },
  // Campañas Salud
  { path: 'campaniasSalud', component: CampaniaSaludComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // dejar siempre al último porque no encuentra las url después de esta
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
