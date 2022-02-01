/*
@jgabriel | 04-03-2017

¡ATENCION EQUIPO!
Siguiendo las guías de estilo de Angular (https://angular.io/styleguide) dejemos ordenados los imports
de la siguiente manera:

1) Módulos principales de Angular
2) Módulos globales
3) Pipes
4) Servicios
5) Componentes
6) Otros
*/

// Angular
import { AgmCoreModule } from '@agm/core';
import { Auth, AuthModule } from '@andes/auth';
// Global
import { Plex, PlexModule } from '@andes/plex';
import { AuthContext, Server, ServerErrorHandler, SharedModule } from '@andes/shared';
/** moment pipes  - desde agular 5 hay que importar el locale a demanda */
import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgDragDropModule } from 'ng-drag-drop';
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
// Libs
import { ChartsModule } from 'ng2-charts';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
/** Configuraciones de entorno */
import { environment } from '../environments/environment';
// Locales
import { AppComponent } from './app.component';
import { appRoutingProviders, routing } from './app.routing';
import { RoutingGuard, RoutingHudsGuard, RoutingNavBar } from './app.routings-guard.class';
import { CampaniaFormComponent } from './apps/campaniaSalud/components/campania-create-update.component';
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
import { CampaniaVisualizacionComponent } from './apps/campaniaSalud/components/campaniaVisualizacion.component';
// Campañas Salud
import { CampaniaSaludService } from './apps/campaniaSalud/services/campaniaSalud.service';
import { GestorUsuariosProvidersModule } from './apps/gestor-usuarios/gestor-usuarios.providers';
import { MitosModule } from './apps/mitos';
import { TurneroProvidersModule } from './apps/turnero/turnero.providers';
import { TurnosPrestacionesService } from './components/buscadorTurnosPrestaciones/services/turnos-prestaciones.service';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { AddformTerapeuticoComponent } from './components/formularioTerapeutico/add-form-terapeutico';
import { ArbolItemComponent } from './components/formularioTerapeutico/arbolItem.component';
import { FormTerapeuticoDetallePageComponent } from './components/formularioTerapeutico/form-terapeutico-detalle.component';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
// Componentes
import { InicioComponent } from './components/inicio/inicio.component';
import { CommonNovedadesService } from './components/novedades/common-novedades.service';
import { HeaderNovedadesComponent } from './components/novedades/header-novedades/header-novedades.component';
import { DetalleNovedadComponent } from './components/novedades/lista-novedades/detalle-novedad/detalle-novedad.component';
import { ListaNovedadesComponent } from './components/novedades/lista-novedades/lista-novedades.component';
import { NovedadesComponent } from './components/novedades/novedades.component';
import { OrganizacionLibModule } from './components/organizacion/organizacion-lib.module';
// ... MPI
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { HistorialCarpetasComponent } from './components/prestamosHC/historial/historial-hc.component';
// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { DevolverHcComponent } from './components/prestamosHC/prestamos/devolver-hc.component';
import { ListarPrestamosComponent } from './components/prestamosHC/prestamos/listar-prestamos.component';
import { ImprimirSolicitudesComponent } from './components/prestamosHC/solicitudes/imprimir-solicitudes.component';
import { ListarSolicitudesComponent } from './components/prestamosHC/solicitudes/listar-solicitudes.component';
import { PrestarHcComponent } from './components/prestamosHC/solicitudes/prestar-hc.component';
import { SolicitudManualComponent } from './components/prestamosHC/solicitudes/solicitud-manual-hc.component';
import { FirmaProfesionalComponent } from './components/profesional/firma/firma-profesional.component';
import { InscripcionProfesionalesComponent } from './components/profesional/inscripcion-profesionales/inscripcion-profesionales.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
// PUCO/ObraSocial
import { PucoComponent } from './components/puco/puco.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';
import { SnomedBuscarService } from './components/snomed/snomed-buscar.service';
import { TOPLibModule } from './components/top/top.module';
import { CITASLibModule } from './components/turnos/citas.module';
import { EditEspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/edit-espacio-fisico.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { FiltrosMapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/filtros-mapa-espacio-fisico.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { MapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarPacienteComponent } from './components/turnos/gestor-agendas/operaciones-agenda/agregar-paciente.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { BuscadorCie10Component } from './components/turnos/gestor-agendas/operaciones-agenda/buscador-cie10.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { ModalAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/modal-agenda.component';
import { DetalleAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/detalle-agenda.component';
import { ListarCarpetasComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-carpetas.component';
import { ListarTurnosComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-turnos.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { SuspenderAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/suspender-agenda.component';
import { AgregarNotaTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/agregar-nota-turno.component';
import { LiberarTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/liberar-turno.component';
import { ReasignarTurnoAgendasComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-agendas.component';
import { ReasignarTurnoAutomaticoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-automatico.component';
import { ReasignarTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno.component';
import { SuspenderTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/suspender-turno.component';
import { RevisionFueraAgendaComponent } from './components/turnos/gestor-agendas/revision/fuera-agenda.component';
// ... Turnos
import { TurnosComponent } from './components/turnos/gestor-agendas/turnos.component';
import { ActivarAppComponent } from './components/turnos/punto-inicio/activar-app.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { ListaSolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/lista-solicitud-turno-ventanilla.component';
import { SolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/solicitud-turno-ventanilla.component';
import { TurnosPacienteComponent } from './components/turnos/punto-inicio/turnos-paciente.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { DatosBasicosComponent } from './core/mpi/components/datos-basicos.component';
import { DatosContactoComponent } from './core/mpi/components/datos-contacto.component';
import { DocumentosPacienteComponent } from './core/mpi/components/documentos-paciente.component';
import { NotaComponent } from './core/mpi/components/notas-paciente.component';
import { PacienteComponent } from './core/mpi/components/paciente.component';
import { RelacionesPacientesComponent } from './core/mpi/components/relaciones-pacientes.component';
import { CarpetaPacienteService } from './core/mpi/services/carpeta-paciente.service';
import { GeoreferenciaService } from './core/mpi/services/georeferencia.service';
import { HistorialBusquedaService } from './core/mpi/services/historialBusqueda.service';
import { PacienteBuscarService } from './core/mpi/services/paciente-buscar.service';
import { PacienteService } from './core/mpi/services/paciente.service';
import { PacienteCacheService } from './core/mpi/services/pacienteCache.service';
import { DirectiveLibModule } from './directives/directives.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { MPILibModule } from './modules/mpi/mpi-lib.module';
import { FormulaBaseService } from './modules/rup/components/formulas';
import { RiesgoCardiovascularService } from './modules/rup/components/formulas/riesgoCardiovascular.service';
// INTERNACION
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';
import { RUPLibModule } from './modules/rup/rup-lib.module';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';
import { CDAService } from './modules/rup/services/CDA.service';
import { CodificacionService } from './modules/rup/services/codificacion.service';
import { ConceptObserverService } from './modules/rup/services/conceptObserver.service';
// ... RUP
import { ElementosRUPService } from './modules/rup/services/elementosRUP.service';
// RUP
import { FrecuentesProfesionalService } from './modules/rup/services/frecuentesProfesional.service';
import { HUDSService } from './modules/rup/services/huds.service';
import { PlantillasService } from './modules/rup/services/plantillas.service';
import { PrestacionesService } from './modules/rup/services/prestaciones.service';
import { ResumenPacienteDinamicoService } from './modules/rup/services/resumenPaciente-dinamico.service';
import { AppMobileService } from './services/appMobile.service';
import { BarrioService } from './services/barrio.service';
import { ConceptosTurneablesService } from './services/conceptos-turneables.service';
import { DisclaimerService } from './services/disclaimer.service';
import { DocumentosService } from './services/documentos.service';
import { DriveService } from './services/drive.service';
import { EspecialidadService } from './services/especialidad.service';
import { FacturacionAutomaticaService } from './services/facturacionAutomatica.service';
import { FinanciadorService } from './services/financiador.service';
import { FormTerapeuticoService } from './services/formTerapeutico/formTerapeutico.service';
import { ValidacionService } from './services/fuentesAutenticas/validacion.service';
import { LocalidadService } from './services/localidad.service';
import { LogService } from './services/log.service';
import { LogPacienteService } from './services/logPaciente.service';
import { ModulosService } from './services/novedades/modulos.service';
import { NovedadesService } from './services/novedades/novedades.service';
import { ObraSocialService } from './services/obraSocial.service';
import { ObraSocialCacheService } from './services/obraSocialCache.service';
import { OcupacionService } from './services/ocupacion/ocupacion.service';
// Pipes
// ... Tablas Maestras
import { OrganizacionService } from './services/organizacion.service';
import { PaisService } from './services/pais.service';
import { ParentescoService } from './services/parentesco.service';
import { PrestacionLegacyService } from './services/prestacionLegacy.service';
import { PrestamosService } from './services/prestamosHC/prestamos-hc.service';
import { ProcedimientosQuirurgicosService } from './services/procedimientosQuirurgicos.service';
import { ProfeService } from './services/profe.service';
import { ProfesionalService } from './services/profesional.service';
import { ProvinciaService } from './services/provincia.service';
import { QueriesService } from './services/query.service';
import { SectoresService } from './services/sectores.service';
// Sugerencias
import { SugerenciasService } from './services/sendmailsugerencias.service';
import { SIISAService } from './services/siisa.service';
import { ConfiguracionPrestacionService } from './services/term/configuracionPrestacion.service';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { TokenExpiredInterceptor } from './services/token-expired.interceptor';
import { ReglaService } from './services/top/reglas.service';
import { AgendaService } from './services/turnos/agenda.service';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
// ... Turnos
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { InstitucionService } from './services/turnos/institucion.service';
import { ListaEsperaService } from './services/turnos/listaEspera.service';
import { SmsService } from './services/turnos/sms.service';
import { TurnoService } from './services/turnos/turno.service';
// TOP
// ... Usuarios
import { UsuarioService } from './services/usuarios/usuario.service';
import { VacunasService } from './services/vacunas.service';
import { WebSocketService } from './services/websocket.service';
import { AcronimoSvgComponent } from './styles/acronimo.svg';
import { LogoSvgComponent } from './styles/logo.svg';
import { MapsComponent } from './utils/mapsComponent';
import { PermisosComponent } from './utils/permisos/permisos.component';

registerLocaleData(localeEs, 'es');

// Main module
@NgModule({
    imports: [
        BrowserAnimationsModule,
        HammerModule,
        PlexModule.forRoot({ networkLoading: true }),
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AuthModule,
        TurneroProvidersModule,
        ChartsModule,
        MitosModule.forRoot(),
        NgDragDropModule.forRoot(),
        routing,
        AgmCoreModule.forRoot({
            apiKey: environment.MAPS_KEY
        }),
        InfiniteScrollModule,
        GestorUsuariosProvidersModule,
        MPILibModule,
        OrganizacionLibModule,
        SharedModule.forRoot(environment.API),
        TOPLibModule,
        DirectiveLibModule,
        CITASLibModule,
        RUPLibModule,
        AuditoriaModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        Ng2ImgMaxModule
    ],
    declarations: [
        AppComponent,
        InicioComponent,
        InscripcionProfesionalesComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent, FirmaProfesionalComponent,
        ProfesionalCreateUpdateComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        MapsComponent,
        PlanificarAgendaComponent,
        BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent, ModalAgendaComponent,
        RevisionAgendaComponent, RevisionFueraAgendaComponent,
        LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        AgregarPacienteComponent,
        ReasignarTurnoComponent, ReasignarTurnoAutomaticoComponent, EstadisticasAgendasComponent, EstadisticasPacientesComponent,
        PermisosComponent,
        PuntoInicioTurnosComponent, ReasignarTurnoAgendasComponent,
        TurnosPacienteComponent,
        SolicitudTurnoVentanillaComponent, ListaSolicitudTurnoVentanillaComponent,
        ActivarAppComponent,
        ReporteC2Component,
        CantidadConsultaXPrestacionComponent,
        EncabezadoReportesComponent,
        ListarTurnosComponent, ListarCarpetasComponent,
        MapaEspacioFisicoComponent, SuspenderAgendaComponent,
        MapaEspacioFisicoVistaComponent,
        DetalleAgendaComponent,
        HeaderPacienteComponent,
        PuntoInicioInternacionComponent,

        // Solicitudes
        PrestamosHcComponent,
        ListarSolicitudesComponent,
        ListarPrestamosComponent,
        PrestarHcComponent,
        DevolverHcComponent,
        NovedadesComponent,
        HeaderNovedadesComponent,
        ListaNovedadesComponent,
        DetalleNovedadComponent,
        HistorialCarpetasComponent,
        ImprimirSolicitudesComponent,
        SolicitudManualComponent,
        PucoComponent,

        // MPI
        NotaComponent,
        RelacionesPacientesComponent,
        BusquedaMpiComponent,
        PacienteComponent,
        DatosBasicosComponent,
        DatosContactoComponent,
        DocumentosPacienteComponent,

        // form Terapeutico
        FormTerapeuticoComponent,
        ArbolItemComponent,
        FormTerapeuticoDetallePageComponent,
        AddformTerapeuticoComponent,
        PucoComponent,

        // Campañas Salud
        CampaniaSaludComponent,
        CampaniaVisualizacionComponent,
        CampaniaFormComponent,

        LogoSvgComponent,
        AcronimoSvgComponent,

    ],
    entryComponents: [
        HeaderPacienteComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },
        { provide: AuthContext, useExisting: Auth },
        HttpClient,
        Plex,
        Server,
        DriveService,
        NovedadesService,
        ModulosService,
        RoutingGuard,
        RoutingNavBar,
        RoutingHudsGuard,
        OrganizacionService,
        SectoresService,
        OcupacionService,
        ProvinciaService,
        TipoEstablecimientoService,
        EspecialidadService,
        ProfesionalService,
        PaisService,
        LocalidadService,
        BarrioService,
        PacienteService,
        PacienteBuscarService,
        FinanciadorService,
        ParentescoService,
        appRoutingProviders,
        ConfigPrestacionService,
        PlanificarAgendaComponent,
        AgendaService,
        AppMobileService,
        TurnoService,
        EspacioFisicoService,
        ListaEsperaService,
        SmsService,
        PrestacionesService,
        AdjuntosService,
        ObraSocialService,
        ObraSocialCacheService,
        ProfeService,
        SIISAService,
        ElementosRUPService,
        ConceptObserverService,
        LogService,
        ValidacionService,
        LogPacienteService,
        UsuarioService,
        FrecuentesProfesionalService,
        DocumentosService,
        ProcedimientosQuirurgicosService,
        PrestamosService,
        ProcedimientosQuirurgicosService,
        FormTerapeuticoService,
        CDAService,
        ReglaService,
        FacturacionAutomaticaService,
        SugerenciasService,
        ConfiguracionPrestacionService,
        PrestacionLegacyService,
        PacienteCacheService,
        GeoreferenciaService,
        HistorialBusquedaService,
        CodificacionService,
        ResumenPacienteDinamicoService,
        VacunasService,
        RiesgoCardiovascularService,
        FormulaBaseService,
        CampaniaSaludService,
        SnomedBuscarService,
        HUDSService,
        TurnosPrestacionesService,
        PlantillasService,
        WebSocketService,
        ConceptosTurneablesService,
        DisclaimerService,
        InstitucionService,
        CommonNovedadesService,
        QueriesService,
        CarpetaPacienteService,
        { provide: ErrorHandler, useClass: environment.environmentName === 'development' ? ErrorHandler : ServerErrorHandler },
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.SITE_KEY,
            } as RecaptchaSettings,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenExpiredInterceptor,
            multi: true,
        }


    ]
})

export class AppModule { }
