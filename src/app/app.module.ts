import { AgregarPacienteComponent } from './components/turnos/gestor-agendas/operaciones-agenda/agregar-paciente.component';
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
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HttpClient } from '@angular/common/http';

// Global
import { PlexModule } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { AuthModule, Auth } from '@andes/auth';
import { SharedModule } from '@andes/shared';
import { RoutingGuard, RoutingNavBar, RoutingHudsGuard } from './app.routings-guard.class';
import { AgmCoreModule } from '@agm/core';
import { MitosModule } from './apps/mitos';
import { MPILibModule } from './modules/mpi/mpi-lib.module';
import { OrganizacionLibModule } from './components/organizacion/organizacion-lib.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';


import { MapsComponent } from './utils/mapsComponent';
import { PermisosComponent } from './utils/permisos/permisos.component';

import { DocumentosService } from './services/documentos.service';

// Pipes

// ... Tablas Maestras
import { OrganizacionService } from './services/organizacion.service';
import { SectoresService } from './services/sectores.service';
import { OcupacionService } from './services/ocupacion/ocupacion.service';
import { ProfesionalService } from './services/profesional.service';
import { EspecialidadService } from './services/especialidad.service';
import { BarrioService } from './services/barrio.service';
import { LocalidadService } from './services/localidad.service';
import { PaisService } from './services/pais.service';
import { PacienteService } from './core/mpi/services/paciente.service';
import { PacienteBuscarService } from './core/mpi/services/paciente-buscar.service';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { FinanciadorService } from './services/financiador.service';
import { ParentescoService } from './services/parentesco.service';
import { ListaEsperaService } from './services/turnos/listaEspera.service';
import { LogService } from './services/log.service';
import { LogPacienteService } from './services/logPaciente.service';
import { PrestamosService } from './services/prestamosHC/prestamos-hc.service';
import { RenaperService } from './services/fuentesAutenticas/servicioRenaper.service';
import { ConfiguracionPrestacionService } from './services/term/configuracionPrestacion.service';
import { PrestacionLegacyService } from './services/prestacionLegacy.service';
import { WebSocketService } from './services/websocket.service';
import { InstitucionService } from './services/turnos/institucion.service';

// ... Turnos
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { AgendaService } from './services/turnos/agenda.service';
import { AppMobileService } from './services/appMobile.service';
import { TurnoService } from './services/turnos/turno.service';
import { SmsService } from './services/turnos/sms.service';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
import { TipoPrestacionService } from './services/tipoPrestacion.service';
import { ObraSocialService } from './services/obraSocial.service';
import { ObraSocialCacheService } from './services/obraSocialCache.service';

import { ProfeService } from './services/profe.service';
import { ReglaService } from './services/top/reglas.service';
import { FacturacionAutomaticaService } from './services/facturacionAutomatica.service';
import { SIISAService } from './services/siisa.service';

// TOP
// ... Usuarios
import { UsuarioService } from './services/usuarios/usuario.service';

// Auditoría
import { SisaService } from './services/fuentesAutenticas/servicioSisa.service';
import { SintysService } from './services/fuentesAutenticas/servicioSintys.service';
import { AnsesService } from './services/fuentesAutenticas/servicioAnses.service';

// RUP
import { FrecuentesProfesionalService } from './modules/rup/services/frecuentesProfesional.service';
import { CDAService } from './modules/rup/services/CDA.service';
import { ResumenPacienteDinamicoService } from './modules/rup/services/resumenPaciente-dinamico.service';
import { VacunasService } from './services/vacunas.service';
import { PlantillasService } from './modules/rup/services/plantillas.service';

// Seguimiento Pacientes SJ
import { SeguimientoPacienteService } from './modules/rup/services/seguimientoPaciente.service';

// Componentes
import { InicioComponent } from './components/inicio/inicio.component';

// Sugerencias
import { SugerenciasService } from './services/sendmailsugerencias.service';

// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { ProcedimientosQuirurgicosService } from './services/procedimientosQuirurgicos.service';

// ... MPI
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { RelacionesPacientesComponent } from './core/mpi/components/relaciones-pacientes.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { GeoreferenciaService } from './core/mpi/services/georeferencia.service';
import { PacienteComponent } from './core/mpi/components/paciente.component';
import { DatosBasicosComponent } from './core/mpi/components/datos-basicos.component';
import { DatosContactoComponent } from './core/mpi/components/datos-contacto.component';


// PUCO/ObraSocial
import { PucoComponent } from './components/puco/puco.component';


// ... Turnos
import { TurnosComponent } from './components/turnos/gestor-agendas/turnos.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { ListaEsperaCreateUpdateComponent } from './components/turnos/lista-espera/listaEspera-create-update.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { LiberarTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/liberar-turno.component';
import { SuspenderTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/suspender-turno.component';
import { ReasignarTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno.component';
import { ReasignarTurnoAutomaticoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-automatico.component';
import { ReasignarTurnoAgendasComponent } from './components/turnos/gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-agendas.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { EditEspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/edit-espacio-fisico.component';
import { FiltrosMapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/filtros-mapa-espacio-fisico.component';
import { AgregarNotaTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/agregar-nota-turno.component';
import { DetalleAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/detalle-agenda.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { RevisionFueraAgendaComponent } from './components/turnos/gestor-agendas/revision/fuera-agenda.component';

import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { TurnosPacienteComponent } from './components/turnos/punto-inicio/turnos-paciente.component';
import { ActivarAppComponent } from './components/turnos/punto-inicio/activar-app.component';
import { SolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/solicitud-turno-ventanilla.component';
import { ListaSolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/lista-solicitud-turno-ventanilla.component';
import { ListarTurnosComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-turnos.component';
import { ListarCarpetasComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-carpetas.component';
import { MapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico.component';
import { SuspenderAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/suspender-agenda.component';
import { ArancelamientoFormComponent } from './components/turnos/punto-inicio/arancelamiento/arancelamiento-form.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { BuscadorCie10Component } from './components/turnos/gestor-agendas/operaciones-agenda/buscador-cie10.component';


// ... RUP
import { ElementosRUPService } from './modules/rup/services/elementosRUP.service';
import { PrestacionesService } from './modules/rup/services/prestaciones.service';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';

import { ConceptObserverService } from './modules/rup/services/conceptObserver.service';

// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';
import { SeguimientoCovidComponent } from './components/reportes/seguimientoCovid.component';

import { TurnosPrestacionesService } from './components/buscadorTurnosPrestaciones/services/turnos-prestaciones.service';
import { QueriesService } from './services/query.service';

// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';


// Libs
import { ChartsModule } from 'ng2-charts';

// INTERNACION

import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';

// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ListarSolicitudesComponent } from './components/prestamosHC/solicitudes/listar-solicitudes.component';
import { ListarPrestamosComponent } from './components/prestamosHC/prestamos/listar-prestamos.component';
import { HistorialCarpetasComponent } from './components/prestamosHC/historial/historial-hc.component';
import { PrestarHcComponent } from './components/prestamosHC/solicitudes/prestar-hc.component';
import { DevolverHcComponent } from './components/prestamosHC/prestamos/devolver-hc.component';
import { ImprimirSolicitudesComponent } from './components/prestamosHC/solicitudes/imprimir-solicitudes.component';
import { SolicitudManualComponent } from './components/prestamosHC/solicitudes/solicitud-manual-hc.component';


// Configuracion prestaciones
import { ConfiguracionPrestacionVisualizarComponent } from './components/configuracionPrestacion/configuracion-prestacion-visualizar.component';
import { ConfiguracionPrestacionCrearComponent } from './components/configuracionPrestacion/configuracion-prestacion-crear.component';

import { RiesgoCardiovascularService } from './modules/rup/components/formulas/riesgoCardiovascular.service';
import { FormulaBaseService } from './modules/rup/components/formulas';
// Campañas Salud
import { CampaniaSaludService } from './apps/campaniaSalud/services/campaniaSalud.service';
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
import { CampaniaVisualizacionComponent } from './apps/campaniaSalud/components/campaniaVisualizacion.component';
import { CampaniaFormComponent } from './apps/campaniaSalud/components/campania-create-update.component';
import { TurneroProvidersModule } from './apps/turnero/turnero.providers';

/** moment pipes  - desde agular 5 hay que importar el locale a demanda */
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { FormTerapeuticoService } from './services/formTerapeutico/formTerapeutico.service';
import { ArbolItemComponent } from './components/formularioTerapeutico/arbolItem.component';
import { FormTerapeuticoDetallePageComponent } from './components/formularioTerapeutico/form-terapeutico-detalle.component';
import { AddformTerapeuticoComponent } from './components/formularioTerapeutico/add-form-terapeutico';
import { NotaComponent } from './core/mpi/components/notas-paciente.component';
import { PacienteCacheService } from './core/mpi/services/pacienteCache.service';
import { HistorialBusquedaService } from './core/mpi/services/historialBusqueda.service';
import { UploadFileComponent } from './shared/components/upload-file.component';
import { CodificacionService } from './modules/rup/services/codificacion.service';

import { SnomedBuscarService } from './components/snomed/snomed-buscar.service';
import { HUDSService } from './modules/rup/services/huds.service';
import { GestorUsuariosProvidersModule } from './apps/gestor-usuarios/gestor-usuarios.providers';

/** Configuraciones de entorno */
import { environment } from '../environments/environment';
import { LogoSvgComponent } from './styles/logo.svg';
import { AcronimoSvgComponent } from './styles/acronimo.svg';
import { NovedadesComponent } from './components/novedades/novedades.component';
import { HeaderNovedadesComponent } from './components/novedades/header-novedades/header-novedades.component';
import { ListaNovedadesComponent } from './components/novedades/lista-novedades/lista-novedades.component';
import { DetalleNovedadComponent } from './components/novedades/lista-novedades/detalle-novedad/detalle-novedad.component';
import { NovedadesService } from './services/novedades/novedades.service';
import { CommonNovedadesService } from './components/novedades/common-novedades.service';
import { ModulosService } from './services/novedades/modulos.service';


import { ConceptosTurneablesService } from './services/conceptos-turneables.service';
import { DisclaimerService } from './services/disclaimer.service';
import { AuthContext } from '@andes/shared';
import { RUPLibModule } from './modules/rup/rup-lib.module';
import { TOPLibModule } from './components/top/top.module';
import { DirectiveLibModule } from './directives/directives.module';
import { CITASLibModule } from './components/turnos/citas.module';
import { NgDragDropModule } from 'ng-drag-drop';

registerLocaleData(localeEs, 'es');

// Main module
@NgModule({
    imports: [
        BrowserAnimationsModule,
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
        SharedModule,
        TOPLibModule,
        DirectiveLibModule,
        CITASLibModule,
        RUPLibModule,
        AuditoriaModule
    ],
    declarations: [
        AppComponent,
        InicioComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent,
        ProfesionalCreateUpdateComponent,
        UploadFileComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        MapsComponent,
        PlanificarAgendaComponent,
        BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent,
        ListaEsperaComponent, ListaEsperaCreateUpdateComponent, RevisionAgendaComponent, RevisionFueraAgendaComponent,
        LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        AgregarPacienteComponent,
        ArancelamientoFormComponent,
        ReasignarTurnoComponent, ReasignarTurnoAutomaticoComponent, EstadisticasAgendasComponent, EstadisticasPacientesComponent,
        PermisosComponent,
        PuntoInicioTurnosComponent, ReasignarTurnoAgendasComponent,
        TurnosPacienteComponent,
        SolicitudTurnoVentanillaComponent, ListaSolicitudTurnoVentanillaComponent,
        ActivarAppComponent,
        ReporteC2Component,
        ConsultaDiagnosticoComponent,
        CantidadConsultaXPrestacionComponent,
        EncabezadoReportesComponent,
        SeguimientoCovidComponent,
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

        // form Terapeutico
        FormTerapeuticoComponent,
        ArbolItemComponent,
        FormTerapeuticoDetallePageComponent,
        AddformTerapeuticoComponent,
        // Configuracion prestacion
        ConfiguracionPrestacionVisualizarComponent,
        ConfiguracionPrestacionCrearComponent,
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
        TipoPrestacionService,
        ObraSocialService,
        ObraSocialCacheService,
        ProfeService,
        SIISAService,
        ElementosRUPService,
        ConceptObserverService,
        LogService,
        SisaService,
        SintysService,
        AnsesService,
        RenaperService,
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
        SeguimientoPacienteService,
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
        QueriesService
    ]
})

export class AppModule { }
