import { AgregarPacienteComponent } from './components/turnos/gestor-agendas/operaciones-agenda/agregar-paciente.component';
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
import { RoutingGuard, RoutingNavBar, RoutingHudsGuard } from './app.routings-guard.class';

// Componentes

// ... Tablas Maestras
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { OrganizacionSectoresComponent } from './components/organizacion/organizacion-sectores.component';
import { OrganizacionOfertaPrestacionalComponent } from './components/organizacion/organizacion-prestaciones.component';

// ... CITAS
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';

// ... MPI
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
// import { ExtranjeroNNCruComponent } from './core/mpi/components/extranjero-nn-cru.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { PacienteComponent } from './core/mpi/components/paciente.component';
// import { BebeCruComponent } from './core/mpi/components/bebe-cru.component';

// ... Obras sociales
import { PucoComponent } from './components/puco/puco.component';

// ... RUP
import { PuntoInicioComponent } from './modules/rup/components/ejecucion/puntoInicio.component';
import { PrestacionEjecucionComponent } from './modules/rup/components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './modules/rup/components/ejecucion/prestacionValidacion.component';
import { PrestacionCrearComponent } from './modules/rup/components/ejecucion/prestacionCrear.component';
import { VistaHudsComponent } from './modules/rup/components/ejecucion/vistaHuds.component';
import { HudsBusquedaPacienteComponent } from './modules/rup/components/ejecucion/hudsBusquedaPaciente.component';

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
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';

// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';

// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ReglasComponent } from './components/top/reglas/reglas.component';
import { VisualizacionReglasTopComponent } from './components/top/reglas/visualizacionReglasTop.component';

// Home de Estadisticas
// import { HomeComponent } from './modules/estadisticas/components/home.component';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { VincularPacientesComponent } from './components/auditoria/vincular-pacientes.component';


// import { HomeComponent } from './modules/estadisticas/components/home.component';

// Campañas salud
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
// Buscador de turnos y prestaciones
import { TurnosPrestacionesComponent } from './components/buscadorTurnosPrestaciones/turnos-prestaciones.component';
import { NuevaSolicitudComponent } from './components/top/solicitudes/nuevaSolicitud.component';
import { INTERNACION_ROUTES } from './apps/rup/mapa-camas/mapa-camas.routing';
import { NovedadesComponent } from './components/novedades/novedades.component';
import { DetalleNovedadComponent } from './components/novedades/lista-novedades/detalle-novedad/detalle-novedad.component';
import { ListaNovedadesComponent } from './components/novedades/lista-novedades/lista-novedades.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'tm/organizacion', component: OrganizacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/organizacion/:id/sectores', component: OrganizacionSectoresComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/organizacion/:id/ofertas_prestacionales', component: OrganizacionOfertaPrestacionalComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/profesional/create', component: ProfesionalCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/profesional/create/:id', component: ProfesionalCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'tm/mapa_espacio_fisico', component: MapaEspacioFisicoVistaComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // MPI
  { path: 'apps/mpi/busqueda', component: BusquedaMpiComponent, canActivate: [RoutingGuard] },
  // { path: 'apps/mpi/bebe', component: PacienteComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/paciente', component: PacienteComponent, canActivate: [RoutingGuard] },
  // { path: 'apps/mpi/extranjero', component: PacienteComponent, canActivate: [RoutingGuard] },
  // { path: 'apps/mpi/bebe/:origen', component: PacienteComponent, canActivate: [RoutingGuard] },
  // { path: 'apps/mpi/extranjero/:origen', component: PacienteComponent, canActivate: [RoutingGuard] },
  { path: 'apps/mpi/paciente/:opcion/:origen', component: PacienteComponent, canActivate: [RoutingGuard] },
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

  { path: 'citas/revision_agenda', component: RevisionAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/revision_agenda/:idAgenda', component: RevisionAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  // { path: 'citas/sobreturnos', component: AgregarSobreturnoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/sobreturnos/:idAgenda', component: AgregarSobreturnoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'citas/paciente/:idAgenda', component: AgregarPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  // RUP
  { path: 'rup', component: PuntoInicioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/crear/:opcion', component: PrestacionCrearComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/vista/:id', component: VistaHudsComponent, canActivate: [RoutingNavBar, RoutingGuard, RoutingHudsGuard] },
  { path: 'rup/huds/paciente/:id', component: VistaHudsComponent, canActivate: [RoutingNavBar, RoutingGuard, RoutingHudsGuard] },
  { path: 'rup/huds', component: HudsBusquedaPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'rup/plantillas', component: PlantillasRUPComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Configuraciones / ABM
  { path: 'configuracionPrestacion', component: ConfiguracionPrestacionVisualizarComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Mapa de camas
  { path: 'internacion/inicio', component: PuntoInicioInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Préstamos HC
  { path: 'prestamosHC', component: PrestamosHcComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // formulario terapeutico
  { path: 'formularioTerapeutico', component: FormTerapeuticoComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Reportes
  { path: 'reportes', component: EncabezadoReportesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'consultaDiagnostico', component: ConsultaDiagnosticoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'encabezadoReportes', component: EncabezadoReportesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'cantidadConsultaXPrestacion', component: CantidadConsultaXPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // ReportesDiarios
  { path: 'reportesDiarios', loadChildren: './components/reportesDiarios/reportes-diarios.module#ReportesDiariosModule', canActivate: [RoutingNavBar, RoutingGuard] },

  // Solicitudes
  { path: 'solicitudes', component: SolicitudesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'solicitudes/:tipo', component: NuevaSolicitudComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'asignadas', component: SolicitudesComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Buscador de turnos y prestaciones
  { path: 'buscador', component: TurnosPrestacionesComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // TOP
  { path: 'top/reglas', component: ReglasComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'top/reglasVisualizacion', component: VisualizacionReglasTopComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // TODO: Verificar si estas rutas todavía son válidas, y ubicarlas en los módulos correspondientes
  /* VERIFICAR ==> */ { path: 'tipoprestaciones', component: TipoPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  // Principal
  { path: 'auth', loadChildren: './apps/auth/auth.module#AuthAppModule' },
  { path: 'inicio', component: InicioComponent, canActivate: [RoutingNavBar, RoutingGuard] },

  { path: 'estadisticas', loadChildren: './modules/estadisticas/estadistica.module#EstadisticaModule', canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'dashboard', loadChildren: './modules/estadisticas/estadistica.module#EstadisticaModule', canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'gestor-usuarios', loadChildren: './apps/gestor-usuarios/gestor-usuarios.module#GestorUsuariosModule', canActivate: [RoutingNavBar, RoutingGuard] },
  // Campañas Salud
  { path: 'campaniasSalud', component: CampaniaSaludComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  // Turnero
  { path: 'pantallas', loadChildren: './apps/turnero/turnero.module#TurneroModule', canActivate: [RoutingNavBar, RoutingGuard] },

  { path: 'internacion', loadChildren: './apps/rup/mapa-camas/mapa-camas.module#MapaCamasModule', canActivate: [RoutingNavBar, RoutingGuard] },

  // dejar siempre al último porque no encuentra las url después de esta
  { path: 'novedades/ver/:novedad', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'novedades/:modulo', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'novedades/:modulo/ver/:novedad', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  { path: 'novedades', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
  // dejar siempre al último porque no encuentra las url después de esta
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
