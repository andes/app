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
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Global
import { PlexModule } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import { RoutingGuard } from './app.routings-guard.class';
import { AgmCoreModule } from 'angular2-google-maps/core';
import { MapsComponent } from './utils/mapsComponent';
import { PermisosComponent } from './utils/permisos/permisos.component';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { HoverClassDirective } from './directives/hover-class.directive';

// Pipes
import { EdadPipe } from './pipes/edad.pipe';
import { ProfesionalPipe } from './pipes/profesional.pipe';
import { FromNowPipe } from './pipes/fromNow.pipe';
import { FechaPipe } from './pipes/fecha.pipe';
import { PacientePipe } from './pipes/paciente.pipe';
import { SexoPipe } from './pipes/sexo.pipe';
import { OrganizacionPipe } from './pipes/organizacion.pipe';
import { SortBloquesPipe } from './pipes/agenda-bloques.pipe';
import { TextFilterPipe } from './pipes/textFilter.pipe';
import { FilterPermisos } from './pipes/filterPermisos.pipe';
import { EnumerarPipe } from './pipes/enumerar.pipe';
import { PluralizarPipe } from './pipes/pluralizar.pipe';
import { IconoCamaPipe } from './pipes/iconoCama.pipe';

// Servicios
// ... Tablas Maestras
import { OrganizacionService } from './services/organizacion.service';
import { ProfesionalService } from './services/profesional.service';
import { EspecialidadService } from './services/especialidad.service';
import { BarrioService } from './services/barrio.service';
import { LocalidadService } from './services/localidad.service';
import { PaisService } from './services/pais.service';
import { PacienteService } from './services/paciente.service';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { FinanciadorService } from './services/financiador.service';
import { ParentescoService } from './services/parentesco.service';
import { ListaEsperaService } from './services/turnos/listaEspera.service';
import { LogService } from './services/log.service';
import { LogPacienteService } from './services/logPaciente.service';
import { PermisosService } from './services/permisos.service';

// ... Turnos
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { AgendaService } from './services/turnos/agenda.service';
import { AppMobileService } from './services/appMobile.service';
import { TurnoService } from './services/turnos/turno.service';
import { SmsService } from './services/turnos/sms.service';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
import { TipoPrestacionService } from './services/tipoPrestacion.service';

// ... Usuarios
import { UsuarioService } from './services/usuarios/usuario.service';

// ... term
import { Cie10Service } from './services/term/cie10.service';

// SNOMED
import { SnomedService } from './services/term/snomed.service';

// ... Llaves
import { LlavesTipoPrestacionService } from './services/llaves/llavesTipoPrestacion.service';

// AUDITORIA
import { AuditoriaPorBloqueService } from './services/auditoria/auditoriaPorBloque.service';
import { AuditoriaService } from './services/auditoria/auditoria.service';

// Auditoría
import { AuditoriaPrestacionPacienteService } from './services/auditoria/auditoriaPrestacionPaciente.service';
import { SisaService } from './services/fuentesAutenticas/servicioSisa.service';
import { SintysService } from './services/fuentesAutenticas/servicioSintys.service';
import { AnsesService } from './services/fuentesAutenticas/servicioAnses.service';

// RUP
import { FrecuentesProfesionalService } from './modules/rup/services/frecuentesProfesional.service';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { SelectOrganizacionComponent } from './components/login/selectOrganizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';
// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { OrganizacionCreateUpdateComponent } from './components/organizacion/organizacion-create-update.component';
import { CamaCreateUpdateComponent } from './components/organizacion/cama-create-update.component';
import { CamasComponent } from './components/organizacion/camas.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { TipoPrestacionCreateUpdateComponent } from './components/tipoPrestacion/tipoPrestacion-create-update.component';
// ... MPI
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { PacienteCreateUpdateComponent } from './components/paciente/paciente-create-update.component';
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { DashboardComponent } from './components/paciente/dashboard.component';
import { PacienteDetalleComponent } from './components/paciente/paciente-detalle';

// ... Turnos
import { TurnosComponent } from './components/turnos/gestor-agendas/turnos.component';
import { ClonarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/clonar-agenda';
import { PlanificarAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { CalendarioComponent } from './components/turnos/dar-turnos/calendario.component';
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
import { CarpetaPacienteComponent } from './components/turnos/gestor-agendas/operaciones-turnos/carpeta-paciente.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { PuntoInicioTurnosComponent } from './components/turnos/dashboard/puntoInicio-turnos.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { PacienteSearchTurnosComponent } from './components/turnos/dashboard/paciente-search-turnos.component';
import { TurnosPacienteComponent } from './components/turnos/dashboard/turnos-paciente.component';
import { DashboardCodificacionComponent } from './components/turnos/dashboard/dashboard-codificacion.component';
import { ActivarAppComponent } from './components/turnos/dashboard/activar-app.component';
import { SolicitudTurnoVentanillaComponent } from './components/turnos/dashboard/solicitud-turno-ventanilla/solicitud-turno-ventanilla.component';
import { ListaSolicitudTurnoVentanillaComponent } from './components/turnos/dashboard/solicitud-turno-ventanilla/lista-solicitud-turno-ventanilla.component';
import { ListarTurnosComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-turnos.component';
import { ListarCarpetasComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-carpetas.component';
import { MapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico.component';

// ... RUP
import { RUPComponent } from './modules/rup/components/core/rup.component';
import { ElementosRUPService } from './modules/rup/services/elementosRUP.service';
import { BuscadorComponent } from './modules/rup/components/ejecucion/buscador.component';
import { HudsBusquedaComponent } from './modules/rup/components/ejecucion/hudsBusqueda.component';
import { PrestacionesService } from './modules/rup/services/prestaciones.service';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';

import { ConceptObserverService } from './modules/rup/services/conceptObserver.service';
import { PrestacionCrearComponent } from './modules/rup/components/ejecucion/prestacionCrear.component';
import { SnomedBuscarComponent } from './components/snomed/snomed-buscar.component';
import { ResumenComponent } from './modules/rup/components/ejecucion/resumen.component';
import { PrestacionValidacionComponent } from './modules/rup/components//ejecucion/prestacionValidacion.component';
import { PrestacionEjecucionComponent } from './modules/rup/components//ejecucion/prestacionEjecucion.component';
import { PuntoInicioComponent } from './modules/rup/components/ejecucion/puntoInicio.component';
import { VistaHudsComponent } from './modules/rup/components/ejecucion/vistaHuds.component';
import { HudsBusquedaPacienteComponent } from './modules/rup/components/ejecucion/hudsBusquedaPaciente.component';
// import { RUPRegistry } from './modules/rup/components/core/rup-.registry';
// TODO: ver con JGabriel!!!
import { TensionSistolicaComponent } from './modules/rup/components/elementos/tensionSistolica.component';
import { TensionDiastolicaComponent } from './modules/rup/components/elementos/tensionDiastolica.component';
import { TensionArterialComponent } from './modules/rup/components/elementos/tensionArterial.component';
import { TemperaturaComponent } from './modules/rup/components/elementos/temperatura.component';
import { TallaComponent } from './modules/rup/components/elementos/talla.component';
import { SolicitudPrestacionDefaultComponent } from './modules/rup/components/elementos/solicitudPrestacionDefault.component';
import { SignosVitalesComponent } from './modules/rup/components/elementos/signosVitales.component';
import { SaturacionOxigenoComponent } from './modules/rup/components/elementos/saturacionOxigeno.component';
import { FrecuenciaCardiacaComponent } from './modules/rup/components/elementos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './modules/rup/components/elementos/frecuenciaRespiratoria.component';
import { PesoComponent } from './modules/rup/components/elementos/peso.component';
import { ObservacionesComponent } from './modules/rup/components/elementos/observaciones.component';
import { NuevaEvolucionProblemaComponent } from './modules/rup/components/elementos/nuevaEvolucionProblema.component';
import { IndiceDeMasaCorporalComponent } from './modules/rup/components/elementos/indiceDeMasaCorporal.component';
import { EvolucionProblemaDefaultComponent } from './modules/rup/components/elementos/evolucionProblemaDefault.component';
import { AutocitadoComponent } from './modules/rup/components/elementos/autocitado.component';
import { ObesidadComponent } from './modules/rup/components/elementos/obesidad.component';
import { HipertensionArterialComponent } from './modules/rup/components/elementos/hipertensionArterial.component';
import { FiltradoGlomerularComponent } from './modules/rup/components/elementos/filtradoGlomerular.component';
import { RiesgoCardiovascularComponent } from './modules/rup/components/elementos/riesgoCardiovascular.component';
import { AdjuntarDocumentoComponent } from './modules/rup/components/elementos/adjuntarDocumento.component';
import { RegistrarMedicamentoDefaultComponent } from './modules/rup/components/elementos/registrarMedicamentoDefault.component';
import { SeguimientoDelPesoComponent } from './modules/rup/components/elementos/seguimientoDelPeso.component';
import { InformesComponent } from './modules/rup/components/elementos/informe.component';
import { TabsComponent } from './modules/rup/components/ejecucion/huds-tabs/tabs/tabs.component';
import { TabComponent } from './modules/rup/components/ejecucion/huds-tabs/tabs/tab.component';


// Llaves
import { LlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/llaves-tipoPrestacion.component';
import { EditarLlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/editar-llaves-tipoPrestacion.component';

// ... Auditoría RUP (prestacionPaciente)
import { AuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/auditoria-prestacionPaciente.component';
import { EditarAuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/editar-auditoria-prestacionPaciente.component';


// AUDITORIA
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { Auditoria2Component } from './components/auditoria/auditoria2.component';
// import { AuditoriaPorBloqueComponent } from './components/auditoria/auditoriaPorBloque.component';

// USUARIO
import { BusquedaUsuarioComponent } from './components/usuario/busquedaUsuario.component';
import { UsuarioCreateComponent } from './components/usuario/usuarioCreate.component';
import { UsuarioUpdateComponent } from './components/usuario/usuarioUpdate.component';
import { ArbolPermisosComponent } from './components/usuario/arbolPermisos.component';

// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';

// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';


// Libs
// import { ChartModule } from 'angular2-chartjs';
import { ChartsModule } from 'ng2-charts';

// Mapa de camas
import { MapaDeCamasComponent } from './components/mapa-de-camas/mapa-de-camas/mapa-de-camas.component';
import { CamaComponent } from './components/mapa-de-camas/cama/cama.component';
// Componentes RUP
// [jgabriel] Por alguna cuestión de Angular's DI no se puede tener esto en otro archivo. WTF?

export let RUPRegistry = {
    'PesoComponent': PesoComponent,
    'EvolucionProblemaDefaultComponent': EvolucionProblemaDefaultComponent,
    'IndiceDeMasaCorporalComponent': IndiceDeMasaCorporalComponent,
    'InformesComponent': InformesComponent,
    'NuevaEvolucionProblemaComponent': NuevaEvolucionProblemaComponent,
    'ObservacionesComponent': ObservacionesComponent,
    'SaturacionOxigenoComponent': SaturacionOxigenoComponent,
    'SignosVitalesComponent': SignosVitalesComponent,
    'SolicitudPrestacionDefaultComponent': SolicitudPrestacionDefaultComponent,
    'TallaComponent': TallaComponent,
    'TemperaturaComponent': TemperaturaComponent,
    'TensionArterialComponent': TensionArterialComponent,
    'TensionDiastolicaComponent': TensionDiastolicaComponent,
    'TensionSistolicaComponent': TensionSistolicaComponent,
    'FrecuenciaCardiacaComponent': FrecuenciaCardiacaComponent,
    'FrecuenciaRespiratoriaComponent': FrecuenciaRespiratoriaComponent,
    'AutocitadoComponent': AutocitadoComponent,
    'ObesidadComponent': ObesidadComponent,
    'HipertensionArterialComponent': HipertensionArterialComponent,
    'FiltradoGlomerularComponent': FiltradoGlomerularComponent,
    'RiesgoCardiovascularComponent': RiesgoCardiovascularComponent,
    'AdjuntarDocumentoComponent': AdjuntarDocumentoComponent,
    'RegistrarMedicamentoDefaultComponent': RegistrarMedicamentoDefaultComponent,
    'SeguimientoDelPesoComponent': SeguimientoDelPesoComponent
};

let RUPComponentsArray = [
    AutocitadoComponent,
    EvolucionProblemaDefaultComponent,
    FiltradoGlomerularComponent,
    FrecuenciaCardiacaComponent,
    FrecuenciaRespiratoriaComponent,
    HipertensionArterialComponent,
    IndiceDeMasaCorporalComponent,
    InformesComponent,
    NuevaEvolucionProblemaComponent,
    ObesidadComponent,
    ObservacionesComponent,
    PesoComponent,
    RegistrarMedicamentoDefaultComponent,
    RiesgoCardiovascularComponent,
    SaturacionOxigenoComponent,
    SeguimientoDelPesoComponent,
    SignosVitalesComponent,
    SolicitudPrestacionDefaultComponent,
    TallaComponent,
    TemperaturaComponent,
    TensionArterialComponent,
    TensionDiastolicaComponent,
    TensionSistolicaComponent,
    AdjuntarDocumentoComponent
];
// for (let key in RUPRegistry) {
//     RUPComponentsArray.push(RUPRegistry[key]);
// }

// Main module
@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        HttpModule,
        PlexModule,
        Ng2DragDropModule,
        ChartsModule,
        routing,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAJuFVuMmVwV8gtP_1m3Ll1VzHagAI_X9I'
        })
    ],
    declarations: [
        AppComponent, InicioComponent, LoginComponent, SelectOrganizacionComponent,
        OrganizacionComponent, OrganizacionCreateUpdateComponent,
        CamaCreateUpdateComponent,CamasComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent,
        ProfesionalCreateUpdateComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        PacienteCreateUpdateComponent, PacienteDetalleComponent, PacienteSearchComponent, DashboardComponent,
        MapsComponent, EdadPipe, ProfesionalPipe, FromNowPipe, FechaPipe, PacientePipe, SexoPipe, OrganizacionPipe, SortBloquesPipe, TextFilterPipe,
        FilterPermisos, EnumerarPipe, PluralizarPipe, IconoCamaPipe,
        PlanificarAgendaComponent, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        TipoPrestacionComponent, TipoPrestacionCreateUpdateComponent,
        DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent,
        ListaEsperaComponent, ListaEsperaCreateUpdateComponent, RevisionAgendaComponent, PopoverAuditComponent,
        RUPComponent, LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        CarpetaPacienteComponent,
        ReasignarTurnoComponent, ReasignarTurnoAutomaticoComponent, EstadisticasAgendasComponent, EstadisticasPacientesComponent,
        AuditoriaComponent,
        PermisosComponent, ArbolPermisosComponent,
        // AuditoriaPorBloqueComponent,
        PuntoInicioComponent,
        Auditoria2Component,
        LlavesTipoPrestacionComponent, EditarLlavesTipoPrestacionComponent,
        AuditoriaPrestacionPacienteComponent, EditarAuditoriaPrestacionPacienteComponent,
        HoverClassDirective, PuntoInicioTurnosComponent, ReasignarTurnoAgendasComponent,
        PacienteSearchTurnosComponent, TurnosPacienteComponent, DashboardCodificacionComponent,
        SolicitudTurnoVentanillaComponent, ListaSolicitudTurnoVentanillaComponent, ActivarAppComponent,
        BusquedaUsuarioComponent, UsuarioCreateComponent, UsuarioUpdateComponent,
        ReporteC2Component,
        ListarTurnosComponent, ListarCarpetasComponent,
        MapaEspacioFisicoComponent,
        ResumenComponent,
        PrestacionCrearComponent,
        PrestacionEjecucionComponent,
        PrestacionValidacionComponent,
        SnomedBuscarComponent,
        HeaderPacienteComponent,
        HudsBusquedaComponent,
        BuscadorComponent,
        VistaHudsComponent,
        HudsBusquedaPacienteComponent,
        // RUP
        ...RUPComponentsArray,
        TabsComponent,
        TabComponent,
        MapaDeCamasComponent,
        CamaComponent
    ],
    entryComponents: RUPComponentsArray,
    bootstrap: [AppComponent],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'es-AR'
        },
        Plex,
        Auth,
        RoutingGuard,
        OrganizacionService,
        ProvinciaService,
        TipoEstablecimientoService,
        EspecialidadService,
        ProfesionalService,
        PaisService,
        LocalidadService,
        BarrioService,
        PacienteService,
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
        Server,
        SmsService,
        PrestacionesService,
        AdjuntosService,
        TipoPrestacionService,
        ElementosRUPService,
        ConceptObserverService,
        LlavesTipoPrestacionService,
        LogService,
        AuditoriaPorBloqueService,
        AuditoriaService,
        AuditoriaPrestacionPacienteService,
        SnomedService,
        Cie10Service,
        SisaService,
        SintysService,
        AnsesService,
        LogPacienteService,
        UsuarioService,
        PermisosService,
        FrecuentesProfesionalService

    ]
})

export class AppModule { }
