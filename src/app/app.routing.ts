// Angular
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Global
import { RoutingGuard, RoutingNavBar } from './app.routings-guard.class';
// Campañas salud
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
// ... Tablas Maestras
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
// Home de Estadisticas
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NovedadesComponent } from './components/novedades/novedades.component';
// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { InscripcionProfesionalesComponent } from './components/profesional/inscripcion-profesionales/inscripcion-profesionales.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
// ... Obras sociales
import { PucoComponent } from './components/puco/puco.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
// REPORTES
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarPacienteComponent } from './components/turnos/gestor-agendas/operaciones-agenda/agregar-paciente.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
// ... CITAS
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
// ... MPI
// import { ExtranjeroNNCruComponent } from './core/mpi/components/extranjero-nn-cru.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { PacienteComponent } from './core/mpi/components/paciente.component';
// Internacion
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';

const appRoutes: Routes = [

    { path: 'tm/profesional', component: ProfesionalComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'tm/profesional/create', component: ProfesionalCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'tm/profesional/create/:id', component: ProfesionalCreateUpdateComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'tm/especialidad', component: EspecialidadComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'tm/espacio_fisico', component: EspacioFisicoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'tm/mapa_espacio_fisico', component: MapaEspacioFisicoVistaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    // MPI
    { path: 'apps/mpi/busqueda', component: BusquedaMpiComponent, canActivate: [RoutingGuard] },
    { path: 'apps/mpi/paciente', component: PacienteComponent, canActivate: [RoutingGuard] },
    { path: 'apps/mpi/paciente/:opcion/:origen', component: PacienteComponent, canActivate: [RoutingGuard] },
    {
        path: 'apps/mpi/auditoria',
        loadChildren: () => import('./modules/auditoria/auditoria.routing').then(m => m.AuditoriaRouting),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },
    // Obras sociales
    { path: 'puco', component: PucoComponent, canActivate: [RoutingNavBar] },

    // Turnos
    { path: 'citas', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/clonarAgenda', component: ClonarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/gestor_agendas', component: GestorAgendasComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    {
        path: 'citas',
        loadChildren: () => import('./components/turnos/gestor-agendas/mapa-agendas/mapa-agenda.module').then(m => m.MapaAgendaModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        data: { modulo: 'citas' }
    },

    { path: 'citas/panelEspacio', component: PanelEspacioComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/agendas', component: PlanificarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/agenda', component: PlanificarAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/turnos', component: DarTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/punto-inicio', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/punto-inicio/:idPaciente', component: PuntoInicioTurnosComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    { path: 'citas/revision_agenda', component: RevisionAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/revision_agenda/:idAgenda', component: RevisionAgendaComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/sobreturnos/:idAgenda', component: AgregarSobreturnoComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'citas/paciente/:idAgenda', component: AgregarPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    {
        path: 'rup',
        loadChildren: () => import('./modules/rup/rup.module').then(m => m.RUPModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },

    {
        path: 'rup',
        loadChildren: () => import('./components/turnos/gestor-agendas/mapa-agendas/mapa-agenda.module').then(m => m.MapaAgendaModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        data: { modulo: 'rup' }
    },

    {
        path: 'huds',
        loadChildren: () => import('./modules/rup/huds.module').then(m => m.HUDSModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },

    {
        path: 'tm/organizacion',
        loadChildren: () => import('./components/organizacion/organizacion.module').then(m => m.OrganizacionesModule),
        canActivate: [RoutingNavBar, RoutingGuard]
    },
    {
        path: 'com',
        loadChildren: () => import('./modules/com/com.module').then(m => m.COMModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },
    {
        path: 'perinatal',
        loadChildren: () => import('./modules/perinatal/perinatal.module').then(m => m.PerinatalModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },
    {
        path: 'forms',
        loadChildren: () => import('./modules/forms-builder/forms.module').then(m => m.FormBuilderModule),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },
    // Mapa de camas
    { path: 'internacion/inicio', component: PuntoInicioInternacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    // Préstamos HC
    { path: 'prestamosHC', component: PrestamosHcComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    // formulario terapeutico
    { path: 'formularioTerapeutico', component: FormTerapeuticoComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    // Reportes
    { path: 'reportes', component: EncabezadoReportesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'cantidadConsultaXPrestacion', component: CantidadConsultaXPrestacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    // ReportesDiarios

    { path: 'reportesDiarios', loadChildren: () => import('./components/reportesDiarios/reportes-diarios.module').then(m => m.ReportesDiariosModule), canActivate: [RoutingNavBar, RoutingGuard] },

    // Buscador de turnos y prestaciones
    { path: 'buscador', loadChildren: () => import('./components/buscadorTurnosPrestaciones/turnos-prestaciones.module').then(m => m.TurnosPrestacionesModule), canActivate: [RoutingNavBar, RoutingGuard] },

    // TOP
    {
        path: 'solicitudes',
        loadChildren: () => import('./components/top/top.routing').then(m => m.TOPRouting),
        canActivate: [RoutingNavBar, RoutingGuard],
        runGuardsAndResolvers: 'always'
    },



    // Principal
    { path: 'auth', loadChildren: () => import('./apps/auth/auth.module').then(m => m.AuthAppModule) },
    { path: 'inicio', component: InicioComponent, canActivate: [RoutingNavBar, RoutingGuard] },

    { path: 'estadisticas', loadChildren: () => import('./modules/estadisticas/estadistica.module').then(m => m.EstadisticaModule), canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'dashboard', loadChildren: () => import('./modules/estadisticas/estadistica.module').then(m => m.EstadisticaModule), canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'gestor-usuarios', loadChildren: () => import('./apps/gestor-usuarios/gestor-usuarios.module').then(m => m.GestorUsuariosModule), canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'visualizacion-informacion', loadChildren: () => import('./modules/visualizacion-informacion/visualizacion-informacion.module').then(m => m.VisualizacionInformacionModule), canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'epidemiologia', loadChildren: () => import('./modules/epidemiologia/epidemiologia.module').then(m => m.EpidemiologiaModule), canActivate: [RoutingNavBar, RoutingGuard] },

    // Campañas Salud
    { path: 'campaniasSalud', component: CampaniaSaludComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    // Turnero
    { path: 'pantallas', loadChildren: () => import('./apps/turnero/turnero.module').then(m => m.TurneroModule), canActivate: [RoutingNavBar, RoutingGuard] },

    { path: 'mapa-camas', loadChildren: () => import('./apps/rup/mapa-camas/mapa-camas.module').then(m => m.MapaCamasModule), canActivate: [RoutingNavBar, RoutingGuard], runGuardsAndResolvers: 'always' },

    { path: 'novedades/ver/:novedad', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'novedades/:modulo', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'novedades/:modulo/ver/:novedad', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'novedades', component: NovedadesComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'vacunacion', loadChildren: () => import('./apps/vacunacion/vacunacion.module').then(m => m.VacunacionModule), canActivate: [] },

    {
        path: 'servicio-intermedio',
        loadChildren: () => import('./apps/servicios-intermedio/servicios-intermedio.module').then(m => m.ServicioIntermedioModule),
        canActivate: [RoutingNavBar, RoutingGuard]
    },

    // Inscripcion de profesionales
    { path: 'inscripcion/profesionales', component: InscripcionProfesionalesComponent, canActivate: [RoutingNavBar] },

    // dejar siempre al último porque no encuentra las url después de esta
    { path: '**', redirectTo: 'inicio' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' });
