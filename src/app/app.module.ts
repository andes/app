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
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { HoverClassDirective } from './directives/hover-class.directive';
// Pipes
import { EdadPipe } from './pipes/edad.pipe';
import { ProfesionalPipe } from './pipes/profesional.pipe';
import { FromNowPipe } from './pipes/fromNow.pipe';
import { FechaPipe } from './pipes/fecha.pipe';
import { PacientePipe } from './pipes/paciente.pipe';
import { OrganizacionPipe } from './pipes/organizacion.pipe';
import { SortBloquesPipe } from './pipes/agenda-bloques.pipe';
import { TextFilterPipe } from './pipes/textFilter.pipe';

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

// ... Turnos
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { AgendaService } from './services/turnos/agenda.service';
import { AppMobileService } from './services/appMobile.service';
import { TurnoService } from './services/turnos/turno.service';
import { SmsService } from './services/turnos/sms.service';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
import { TipoPrestacionService } from './services/tipoPrestacion.service';
// ... RUP
import { ProblemaPacienteService } from './services/rup/problemaPaciente.service';
import { PrestacionPacienteService } from './services/rup/prestacionPaciente.service';
import { ObservarDatosService } from './services/rup/observarDatos.service';

// ... term
import { Cie10Service } from './services/term/cie10.service';

// SNOMED
import { SnomedService } from './services/snomed.service';

// ... Llaves
import { LlavesTipoPrestacionService } from './services/llaves/llavesTipoPrestacion.service';

// AUDITORIA
import { AuditoriaPorBloqueService } from './services/auditoria/auditoriaPorBloque.service';
import { AuditoriaService } from './services/auditoria/auditoria.service';

// Auditoría
import { AuditoriaPrestacionPacienteService } from './services/auditoria/auditoriaPrestacionPaciente.service';
import { SisaService } from './services/fuentesAutenticas/servicioSisa.service';
import { SintysService } from './services/fuentesAutenticas/servicioSintys.service';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { OrganizacionCreateUpdateComponent } from './components/organizacion/organizacion-create-update.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { TipoPrestacionCreateUpdateComponent } from './components/tipoPrestacion/tipoPrestacion-create-update.component';
// ... MPI
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { PacienteCreateUpdateComponent } from './components/paciente/paciente-create-update.component';
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { DashboardComponent } from './components/paciente/dashboard.component';

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
import { AgregarNotaTurnoComponent } from './components/turnos/gestor-agendas/operaciones-turnos/agregar-nota-turno.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { DashboardTurnosComponent } from './components/turnos/dashboard/dashboard-turnos.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { PacienteSearchTurnosComponent } from './components/turnos/dashboard/paciente-search-turnos.component';
import { TurnosPacienteComponent } from './components/turnos/dashboard/turnos-paciente.component';
import { ActivarAppComponent } from './components/turnos/dashboard/activar-app.component';

// ... RUP
import { RupComponent } from './components/rup/rup.component';
import { PrestacionValidacionComponent } from './components/rup/ejecucion/prestacionValidacion.component';
import { PesoComponent } from './components/rup/atomos/peso.component';
import { SaturacionOxigenoComponent } from './components/rup/atomos/saturacionOxigeno.component';
import { TallaComponent } from './components/rup/atomos/talla.component';
import { TemperaturaComponent } from './components/rup/atomos/temperatura.component';
import { FrecuenciaCardiacaComponent } from './components/rup/atomos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './components/rup/atomos/frecuenciaRespiratoria.component';
import { TensionSistolicaComponent } from './components/rup/atomos/tensionSistolica.component';
import { TensionDiastolicaComponent } from './components/rup/atomos/tensionDiastolica.component';
import { SignosVitalesComponent } from './components/rup/moleculas/signos-vitales/signosVitales.component';
import { TensionArterialComponent } from './components/rup/moleculas/tension-arterial/tensionArterial.component';
import { PrestacionEjecucionComponent } from './components/rup/ejecucion/prestacionEjecucion.component';
import { ResumenComponent } from './components/rup/ejecucion/resumen.component';
import { NuevoProblemaComponent } from './components/rup/problemas-paciente/nuevoProblema.component';
import { EvolucionTodosProblemasComponent } from './components/rup/problemas-paciente/evolucionTodosProblemas.component';
import { EvolucionProblemaComponent } from './components/rup/problemas-paciente/evolucionProblema.component';
import { EnmendarProblemaComponent } from './components/rup/problemas-paciente/enmendarProblema.component';
import { TransformarProblemaComponent } from './components/rup/problemas-paciente/transformarProblema.component';
import { verProblemaComponent } from './components/rup/problemas-paciente/verProblema.component';
import { ConsultaGeneralClinicaMedicaComponent } from './components/rup/moleculas/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
import { ObservacionesComponent } from './components/rup/atomos/observaciones.component';
import { PuntoInicioComponent } from './components/rup/ejecucion/puntoInicio.component';
import { EdadGestacionalComponent } from './components/rup/atomos/perinatales-nacimiento/edadGestacional.component';
import { ScoreApgarComponent } from './components/rup/atomos/perinatales-nacimiento/scoreApgar.component';
import { NacimientoComponent } from './components/rup/moleculas/nacimiento/nacimiento.component';
import { EdadGestacionalFetalComponent } from './components/rup/moleculas/edad-gestacional-fetal/edadGestacionalFetal.component';
import { PesquisaNeonatalComponent } from './components/rup/atomos/pesquisaNeonatal.component';
import { PruebaOtoemisionesAcusticasComponent } from './components/rup/atomos/pruebaOtoemisionesAcusticas.component';
import { PercentiloTallaComponent } from './components/rup/atomos/percentiloTalla.component';
import { PercentiloCircunferenciaCefalicaNinoComponent } from './components/rup/atomos/percentiloCircunferenciaCefalicaNino.component';
import { DesarrolloMotorComponent } from './components/rup/atomos/desarrolloMotor.component';
import { ActitudAnteLosCuidadosComponent } from './components/rup/atomos/actitudAnteLosCuidados.component';
import { ControlDeEsfinteresComponent } from './components/rup/atomos/controlDeEsfinteres.component';
import { DesarrolloIntelectualyJuegosComponent } from './components/rup/atomos/desarrolloIntelectualyJuegos.component';
import { EscalaDeDesarrolloComponent } from './components/rup/moleculas/escala-de-desarrollo/escalaDeDesarrollo.component';
import { FactoresDeRiesgoNinoSanoComponent } from './components/rup/atomos/factores-riesgo/factoresDeRiesgoNinoSano.component';
import { IndiceDeMasaCorporalComponent } from './components/rup/formulas/indice-de-masa-corporal/indiceDeMasaCorporal.component';
import { Formula } from './components/rup/core/formula.component';
import { RegistrosVisitasComponent } from './components/rup/moleculas/nino-sano/registro-visitas/registrosVisitas.component';
import { DatosPerinatalesComponent } from './components/rup/moleculas/nino-sano/datos-perinatales/datosPerinatales.component';
import { NinoSanoComponent } from './components/rup/moleculas/nino-sano/ninoSano.component';
import { Molecula } from './components/rup/core/molecula.component';
import { Atomo } from './components/rup/core/atomoComponent';
import { EcografiaComponent } from './components/rup/moleculas/ecografia.component';
import { InterConsultaComponent } from './components/rup/moleculas/interConsulta.component';
import { LaboratorioComponent } from './components/rup/moleculas/laboratorio.component';
import { RadiografiaComponent } from './components/rup/moleculas/radiografia.component';
import { TomografiaComponent } from './components/rup/moleculas/tomografia/tomografia.component';
import { MamografiaComponent } from './components/rup/moleculas/mamografia/mamografia.component';
import { EndoscopiaComponent } from './components/rup/moleculas/endoscopia/endoscopia.component';
import { TomaPapComponent } from './components/rup/moleculas/toma-pap/tomaPap.component';
import { TomaHpvComponent } from './components/rup/moleculas/toma-hpv/tomaHpv.component';
import { SangreOcultaMateriaFecalComponent } from './components/rup/moleculas/sangre-oculta-materia-fecal/sangreOcultaMateriaFecal.component';
// snomed
import { SnomedBuscarComponent } from './components/snomed/snomed-buscar.component';

// ATOMO SOCIOECONOMICO
import { ViviendaSituacionSocioEconomicaComponent } from './components/rup/moleculas/vivienda-situacion-socioeconomica-familiar/viviendaSituacionSocioEconomica.component';
import { ViviendaResiduosComponent } from './components/rup/atomos/socio-economicos/viviendaResiduos.component';
import { ViviendaPisoComponent } from './components/rup/atomos/socio-economicos/viviendaPiso.component';
import { ViviendaNivelInstruccionComponent } from './components/rup/atomos/socio-economicos/viviendaNivelInstruccion.component';
import { ViviendaFamiliaComponent } from './components/rup/atomos/socio-economicos/viviendaFamilia.component';
import { ViviendaContaminantesComponent } from './components/rup/atomos/socio-economicos/viviendaContaminantes.component';
import { ViviendaCombustionComponent } from './components/rup/atomos/socio-economicos/viviendaCombustion.component';
import { ViviendaSostenEconomicoComponent } from './components/rup/atomos/socio-economicos/viviendaSostenEconomico.component';
import { ViviendaAsistenciaEconomicaComponent } from './components/rup/atomos/socio-economicos/viviendaAsistenciaEconomica.component';
import { ViviendaCondicionesAlojamientoComponent } from './components/rup/moleculas/vivienda-condiciones-y-alojamiento/viviendaCondicionesAlojamiento.component';
// PERINATALES EMBARAZO
import { PerinatalesEmbarazoNormalComponent } from './components/rup/atomos/perinatales-embarazo/perinatalesEmbarazoNormal.component';
import { PerinatalesEmbarazoAnormalComponent } from './components/rup/atomos/perinatales-embarazo/perinatalesEmbarazoAnormal.component';
import { PerinatalesNumeroGestaComponent } from './components/rup/atomos/perinatales-embarazo/perinatalesNumeroGesta.component';
import { PerinatalesGestacionMultipleComponent } from './components/rup/atomos/perinatales-embarazo/perinatalesGestacionMultiple.component';
// PERINATALES PARTO
import { PartoViaVaginalComponent } from './components/rup/atomos/perinatales-parto/partoViaVaginal.component';
import { PartoViaVaginalForcepsComponent } from './components/rup/atomos/perinatales-parto/partoViaVaginalForceps.component';
import { PartoVaginalAsistidoExtractorVacioComponent } from './components/rup/atomos/perinatales-parto/partoVaginalAsistidoExtractorVacio.component';
import { PartoCesareaComponent } from './components/rup/atomos/perinatales-parto/partoCesarea.component';
import { HallazgoRelacionadoPartoComponent } from './components/rup/atomos/perinatales-parto/hallazgoRelacionadoParto.component';
// NIÑO SANO
import { OdontologiaComponent } from './components/rup/atomos/odontologia.component';
import { EstadoNutricionalComponent } from './components/rup/atomos/estadoNutricional.component';

// Llaves
import { LlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/llaves-tipoPrestacion.component';
import { EditarLlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/editar-llaves-tipoPrestacion.component';

// ... Auditoría RUP (prestacionPaciente)
import { AuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/auditoria-prestacionPaciente.component';
import { EditarAuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/editar-auditoria-prestacionPaciente.component';

// AUDITORIA
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { Auditoria2Component } from './components/auditoria/auditoria2.component';
import { AuditoriaPorBloqueComponent } from './components/auditoria/auditoriaPorBloque.component';

// USUARIO
import { BusquedaUsuarioComponent } from './components/usuario/busquedaUsuario.component';



export const RUP_COMPONENTS = [
    TensionArterialComponent,
    SignosVitalesComponent,
    FrecuenciaCardiacaComponent,
    FrecuenciaRespiratoriaComponent,
    PesoComponent,
    SaturacionOxigenoComponent,
    TallaComponent,
    TemperaturaComponent,
    TensionSistolicaComponent,
    TensionDiastolicaComponent,
    ObservacionesComponent,
    ConsultaGeneralClinicaMedicaComponent,
    NuevoProblemaComponent,
    EvolucionProblemaComponent,
    EvolucionTodosProblemasComponent,
    PuntoInicioComponent,
    PrestacionEjecucionComponent,
    ResumenComponent,
    HeaderPacienteComponent,
    PrestacionValidacionComponent,
    EdadGestacionalComponent,
    ScoreApgarComponent,
    NacimientoComponent,
    EdadGestacionalFetalComponent,
    ViviendaAsistenciaEconomicaComponent,
    ViviendaCombustionComponent,
    ViviendaContaminantesComponent,
    ViviendaFamiliaComponent,
    ViviendaPisoComponent,
    ViviendaResiduosComponent,
    ViviendaSituacionSocioEconomicaComponent,
    ViviendaSostenEconomicoComponent,
    ViviendaNivelInstruccionComponent,
    ViviendaCondicionesAlojamientoComponent,
    PerinatalesEmbarazoNormalComponent,
    PerinatalesEmbarazoAnormalComponent,
    PerinatalesNumeroGestaComponent,
    PerinatalesGestacionMultipleComponent,
    HallazgoRelacionadoPartoComponent,
    PartoCesareaComponent,
    PartoVaginalAsistidoExtractorVacioComponent,
    PartoViaVaginalForcepsComponent,
    PartoViaVaginalComponent,
    EvolucionProblemaComponent,
    EnmendarProblemaComponent,
    TransformarProblemaComponent,
    verProblemaComponent,
    PruebaOtoemisionesAcusticasComponent,
    PesquisaNeonatalComponent,
    PercentiloTallaComponent,
    PercentiloCircunferenciaCefalicaNinoComponent,
    DesarrolloMotorComponent,
    ActitudAnteLosCuidadosComponent,
    ControlDeEsfinteresComponent,
    DesarrolloIntelectualyJuegosComponent,
    EscalaDeDesarrolloComponent,
    EstadoNutricionalComponent,
    OdontologiaComponent,
    IndiceDeMasaCorporalComponent,
    FactoresDeRiesgoNinoSanoComponent,
    Atomo,
    Molecula,
    NinoSanoComponent,
    DatosPerinatalesComponent,
    RegistrosVisitasComponent,
    Formula,
    EcografiaComponent,
    InterConsultaComponent,
    LaboratorioComponent,
    RadiografiaComponent,
    SnomedBuscarComponent,
    TomografiaComponent,
    MamografiaComponent,
    EndoscopiaComponent,
    TomaHpvComponent,
    TomaPapComponent,
    SangreOcultaMateriaFecalComponent
];

// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';

// Ver donde poner
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

// Main module
@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        HttpModule,
        PlexModule,
        Ng2DragDropModule,
        routing,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAJuFVuMmVwV8gtP_1m3Ll1VzHagAI_X9I'
        }),
        ConfirmationPopoverModule.forRoot({
            confirmButtonType: 'danger' // set defaults here
        })
    ],

    declarations: [
        AppComponent, InicioComponent, LoginComponent,
        OrganizacionComponent, OrganizacionCreateUpdateComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent,
        ProfesionalCreateUpdateComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        PacienteCreateUpdateComponent, PacienteSearchComponent, DashboardComponent,
        MapsComponent, EdadPipe, ProfesionalPipe, FromNowPipe, FechaPipe, PacientePipe, OrganizacionPipe, SortBloquesPipe, TextFilterPipe,
        PlanificarAgendaComponent, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent,
        TipoPrestacionComponent, TipoPrestacionCreateUpdateComponent,
        DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent,
        ListaEsperaComponent, ListaEsperaCreateUpdateComponent, RevisionAgendaComponent, PopoverAuditComponent,
        RupComponent, LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        DashboardTurnosComponent, ReasignarTurnoComponent, ReasignarTurnoAutomaticoComponent, ReasignarTurnoAgendasComponent, EstadisticasAgendasComponent, EstadisticasPacientesComponent,
        ActivarAppComponent,
        PacienteSearchTurnosComponent, TurnosPacienteComponent,
        AuditoriaComponent, AuditoriaPorBloqueComponent, Auditoria2Component,
        ...RUP_COMPONENTS,
        LlavesTipoPrestacionComponent, EditarLlavesTipoPrestacionComponent,
        AuditoriaPrestacionPacienteComponent, EditarAuditoriaPrestacionPacienteComponent,
        HoverClassDirective,
        BusquedaUsuarioComponent
    ],
    entryComponents: RUP_COMPONENTS,
    bootstrap: [AppComponent],
    providers: [{
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
        // EspacioFisicoComponent,
        AgendaService,
        AppMobileService,
        TurnoService,
        EspacioFisicoService,
        ListaEsperaService,
        Server,
        SmsService,
        PrestacionPacienteService,
        ProblemaPacienteService,
        TipoPrestacionService,

        ObservarDatosService,
        LlavesTipoPrestacionService,

        LogService,
        AuditoriaPorBloqueService,
        AuditoriaService,

        AuditoriaPrestacionPacienteService,

        SnomedService,
        Cie10Service,

        SisaService,
        SintysService,
    ]
})

export class AppModule { }
