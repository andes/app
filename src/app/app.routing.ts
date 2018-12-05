import { GestorHojatrabajoComponent } from './apps/rup/laboratorio/components/hojatrabajo/gestor-hojatrabajo/gestor-hojatrabajo.component';
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
import { OrganizacionSectoresComponent } from './components/organizacion/organizacion-sectores.component';

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
import { PacienteDemoComponent } from './modules/mpi/components/demo.component';

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
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';

// CONFIGURACION PRESTACION
import { ConfiguracionPrestacionVisualizarComponent } from './components/configuracionPrestacion/configuracion-prestacion-visualizar.component';

// Internacion
import { MapaDeCamasComponent } from './modules/rup/components/internacion/mapa-de-camas/mapa-de-camas/mapa-de-camas.component';
import { IniciarInternacionComponent } from './modules/rup/components/ejecucion/internacion/iniciarInternacion.component';
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';
// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';
import { OcuparCamaComponent } from './modules/rup/components/ejecucion/internacion/ocuparCama.component';
import { CensoDiarioComponent } from './modules/rup/components/internacion/censo/censoDiario.component';
import { CensoMensualComponent } from './modules/rup/components/internacion/censo/censoMensual.component';
import { CamaCreateUpdateComponent } from './modules/rup/components/internacion/mapa-de-camas/cama/cama-create-update.component';
// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ReglasComponent } from './components/top/reglas/reglas.component';
// SIL
// import { PracticaListadoComponent } from './apps/rup/laboratorio/components/protocolos/buscador-practicas/practica-listado.component';
import { LaboratorioComponent } from './apps/rup/laboratorio/components/laboratorio.component';
import { ProtocoloDetalleComponent } from './apps/rup/laboratorio/components/protocolos/protocolo-detalle.component';
// import { PracticaDemoComponent } from './apps/rup/laboratorio/components/demoPractica.component';
import { TablaDatalleProtocoloComponent } from './apps/rup/laboratorio/components/protocolos/tabla-detalle-protocolo/tabla-datalle-protocolo.component';
import { GestorProtocolosComponent } from './apps/rup/laboratorio/components/gestor-protocolos/gestor-protocolos.component';
import { ListaProtocolosComponent } from './apps/rup/laboratorio/components/lista-protocolos/lista-protocolos.component';
import { PuntoInicioLaboratorioComponent } from './apps/rup/laboratorio/components/punto-inicio/punto-inicio.component';
import { ListadoSolicitudesComponent } from './apps/rup/laboratorio/components/punto-inicio/listado-solicitudes/listado-solicitudes.component';
import { FiltrosBusquedaProtocoloComponent } from './apps/rup/laboratorio/components/gestor-protocolos/filtros-busqueda/filtros-busqueda-protocolo.component';
import { ProtocoloEncabezadoComponent } from './apps/rup/laboratorio/components/protocolos/protocolo-encabezado/protocolo-encabezado.component';
import { ProtocoloEncabezadoVistaComponent } from './apps/rup/laboratorio/components/protocolos/protocolo-encabezado/protocolo-encabezado-vista/protocolo-encabezado-vista.component';
import { ProtocoloEncabezadoEdicionComponent } from './apps/rup/laboratorio/components/protocolos/protocolo-encabezado/protocolo-encabezado-edicion/protocolo-encabezado-edicion.component';
import { VisualizacionReglasComponent } from './components/top/reglas/visualizacionReglas.component';

// Home de Estadisticas
// import { HomeComponent } from './modules/estadisticas/components/home.component';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';

// import { HomeComponent } from './modules/estadisticas/components/home.component';

// Campañas salud
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';

const appRoutes: Routes = [
  // Tablas maestras
  { path: 'tm/organizacion', component: OrganizacionComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/:id/sectores', component: OrganizacionSectoresComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/cama/:idCama', component: CamaCreateUpdateComponent, canActivate: [RoutingGuard] },
  { path: 'tm/organizacion/cama', component: CamaCreateUpdateComponent, canActivate: [RoutingGuard] },
  { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingGuard] },
  { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingGuard] },
  { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingGuard] },

  // MPI
  { path: 'mpi', component: PacienteSearchComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria', component: AuditoriaComponent, canActivate: [RoutingGuard] },
  { path: 'mpi/auditoria2', component: Auditoria2Component, canActivate: [RoutingGuard] },
  { path: 'mpi', component: PacienteSearchComponent, canActivate: [RoutingGuard] },

  // Obras sociales
  { path: 'puco', component: PucoComponent },

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
  { path: 'rup/internacion/ocuparCama/:idCama/:idInternacion', component: OcuparCamaComponent, canActivate: [RoutingGuard] },
  { path: 'rup/resumen/:id', component: ResumenComponent, canActivate: [RoutingGuard] },
  { path: 'rup/ejecucion/:id', component: PrestacionEjecucionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/validacion/:id', component: PrestacionValidacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/auditoriaRUP', component: AuditoriaPrestacionPacienteComponent, canActivate: [RoutingGuard] },
  { path: 'rup/llavesTipoPrestacion', component: LlavesTipoPrestacionComponent, canActivate: [RoutingGuard] },
  { path: 'rup/vista/:id', component: VistaHudsComponent, canActivate: [RoutingGuard] },
  { path: 'rup/buscaHuds', component: HudsBusquedaPacienteComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/censo', component: CensoDiarioComponent, canActivate: [RoutingGuard] },
  { path: 'rup/internacion/censo/mensual', component: CensoMensualComponent, canActivate: [RoutingGuard] },

  // configuracion prestacion
  { path: 'configuracionPrestacion', component: ConfiguracionPrestacionVisualizarComponent, canActivate: [RoutingGuard] },


  // Mapa de camas
  { path: 'internacion/camas', component: MapaDeCamasComponent, canActivate: [RoutingGuard] },
  { path: 'internacion/inicio', component: PuntoInicioInternacionComponent, canActivate: [RoutingGuard] },

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
  // Laboratorio
  // { path: 'laboratorio', redirectTo: 'laboratorio/recepcion' },
  { path: 'laboratorio/recepcion', component: PuntoInicioLaboratorioComponent, canActivate: [RoutingGuard] },
  { path: 'laboratorio/recepcion/:id', component: PuntoInicioLaboratorioComponent, canActivate: [RoutingGuard] },
  { path: 'laboratorio/protocolos', component: LaboratorioComponent, canActivate: [RoutingGuard] },
  { path: 'laboratorio/protocolos/sinTurno', component: LaboratorioComponent, canActivate: [RoutingGuard] },
  { path: 'laboratorio/protocolos/sinTurno/:id', component: LaboratorioComponent, canActivate: [RoutingGuard] },
  { path: 'laboratorio/hojatrabajo', component: GestorHojatrabajoComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio', component: GestorProtocolosComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio', component: ProtocoloDetalleComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio', component: TablaDatalleProtocolo, canActivate: [RoutingGuard] },
  // { path: 'laboratorio', component: ListaProtocolosComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio/', component: ListadoSolicitudesComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio/', component: FiltrosBusquedaProtocoloComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio/', component: ProtocoloEncabezadoComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio/', component: ProtocoloEncabezadoEdicionComponent, canActivate: [RoutingGuard] },
  // { path: 'laboratorio/', component: ProtocoloEncabezadoVistaComponent, canActivate: [RoutingGuard] },



  // TOP
  { path: 'top/reglas', component: ReglasComponent, canActivate: [RoutingGuard] },
  { path: 'top/reglasVisualizacion', component: VisualizacionReglasComponent, canActivate: [RoutingGuard] },

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
  // Campañas Salud
  { path: 'campaniasSalud', component: CampaniaSaludComponent, canActivate: [RoutingGuard] },

  // dejar siempre al último porque no encuentra las url después de esta
  { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
