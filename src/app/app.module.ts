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
import { NgChartsModule } from 'ng2-charts';
import { NgxImageCompressService } from 'ngx-image-compress';
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
import { NovedadesComponent } from './components/novedades/novedades.component';
import { ListaNovedadesComponent } from './components/novedades/lista-novedades/lista-novedades.component';
import { OrganizacionLibModule } from './components/organizacion/organizacion-lib.module';
import { CatalogoNovedadesComponent } from './components/novedades/catalogo-novedades/catalogo-novedades.component';
import { FiltroNovedadesComponent } from './components/novedades/catalogo-novedades/filtro-novedades/filtro-novedades.component';
import { CalendarioNovedadesComponent } from './components/novedades/lista-novedades/calendario/calendario-novedades.component';
import { DetalleNovedadComponent } from './components/novedades/detalle-novedad/detalle-novedad.component';
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
import { FarmaciaCreateUpdateComponent } from './components/farmacia/farmacia-create-update.component';
// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { FarmaciaComponent } from './components/farmacia/farmacia.component';
// PUCO/ObraSocial
import { PucoComponent } from './components/puco/puco.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';
import { SnomedBuscarService } from './components/snomed/snomed-buscar.service';
import { TOPLibModule } from './components/top/top.module';
import { CITASLibModule } from './components/turnos/citas.module';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { MapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico.component';

import { AgregarPacienteComponent } from './components/turnos/gestor-agendas/operaciones-agenda/agregar-paciente.component';
import { BuscadorCie10Component } from './components/turnos/gestor-agendas/operaciones-agenda/buscador-cie10.component';

import { ListarCarpetasComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-carpetas.component';
import { ListarTurnosComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-turnos.component';

import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { SuspenderAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/suspender-agenda.component';

import { CarpetaPacienteService } from './core/mpi/services/carpeta-paciente.service';
import { GeoreferenciaService } from './core/mpi/services/georeferencia.service';
import { HistorialBusquedaService } from './core/mpi/services/historialBusqueda.service';
import { PacienteBuscarService } from './core/mpi/services/paciente-buscar.service';
import { PacienteService } from './core/mpi/services/paciente.service';
import { PacienteCacheService } from './core/mpi/services/pacienteCache.service';
import { PacienteVinculadoCacheService } from './core/mpi/services/pacienteVinculadoCache.service';
import { DirectiveLibModule } from './directives/directives.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ValidarCertificadoComponent } from './modules/epidemiologia/components/validar-certificado/validar-certificado.component';
import { ValidarCertificadoService } from './modules/epidemiologia/services/validar-certificado.service';
import { MPILibModule } from './modules/mpi/mpi-lib.module';
import { FormulaBaseService } from './modules/rup/components/formulas';
import { RiesgoCardiovascularService } from './modules/rup/components/formulas/riesgoCardiovascular.service';
import { demandaInsatisfechaComponent } from './components/turnos/dashboard/demandaInsatisfecha';

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
import { VisualizacionInformacionModule } from './modules/visualizacion-informacion/visualizacion-informacion.module';
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
import { FarmaciaService } from './services/farmacia.service';
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
        NgChartsModule,
        MitosModule.forRoot(),
        NgDragDropModule.forRoot(),
        routing,
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
        VisualizacionInformacionModule
    ],
    declarations: [
        AppComponent,
        InicioComponent,
        InscripcionProfesionalesComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent, FirmaProfesionalComponent,
        ProfesionalCreateUpdateComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,


        BuscadorCie10Component,
        AgregarPacienteComponent,

        PermisosComponent,

        // ActivarAppComponent,
        ReporteC2Component,
        CantidadConsultaXPrestacionComponent,
        EncabezadoReportesComponent,
        ListarTurnosComponent, ListarCarpetasComponent,
        MapaEspacioFisicoComponent, SuspenderAgendaComponent,
        MapaEspacioFisicoVistaComponent,

        HeaderPacienteComponent,
        PuntoInicioInternacionComponent,
        ValidarCertificadoComponent,
        // demandaInsatisfechaComponent,
        FarmaciaComponent,
        FarmaciaCreateUpdateComponent,

        // Solicitudes
        PrestamosHcComponent,
        ListarSolicitudesComponent,
        ListarPrestamosComponent,
        PrestarHcComponent,
        DevolverHcComponent,
        HistorialCarpetasComponent,
        SolicitudManualComponent,


        NovedadesComponent,
        ListaNovedadesComponent,
        HeaderNovedadesComponent,
        CatalogoNovedadesComponent,
        FiltroNovedadesComponent,
        CalendarioNovedadesComponent,
        DetalleNovedadComponent,
        ImprimirSolicitudesComponent,
        PucoComponent,
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
        PacienteVinculadoCacheService,
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
        ValidarCertificadoService,
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
        },
        NgxImageCompressService,
        FarmaciaService
    ]
})

export class AppModule { }
