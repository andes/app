
import { RupComponent } from './components/rup/rup.component';
import { PacienteService } from './services/paciente.service';
import { PacienteComponent } from './components/paciente/paciente.component';
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
// Angular
import { LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

// Plex
import { PlexModule } from '@andes/plex/src/lib/module';
import { Plex } from '@andes/plex';

// Server
import { Server } from '@andes/shared';

// Routing
import { routing, appRoutingProviders } from './app.routing';

// RUP
import { EdadGestacionalComponent } from './components/rup/atomos/perinatales-nacimiento/edadGestacional.component';
import { ScoreApgarComponent } from './components/rup/atomos/perinatales-nacimiento/scoreApgar.component';
import { EdadGestacionalFetalComponent } from './components/rup/moleculas/edad-gestacional-fetal/edadGestacionalFetal.component';
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
import { PuntoInicioComponent } from './components/rup/ejecucion/puntoInicio.component';
import { ResumenComponent } from './components/rup/ejecucion/resumen.component';
import { EvolucionTodosProblemasComponent } from './components/rup/problemas-paciente/evolucionTodosProblemas.component';
import { EvolucionProblemaComponent } from './components/rup/problemas-paciente/evolucionProblema.component';
import { TransformarProblemaComponent } from './components/rup/problemas-paciente/transformarProblema.component';
import { PruebaOtoemisionesAcusticasComponent } from './components/rup/atomos/pruebaOtoemisionesAcusticas.component';
import { PesquisaNeonatalComponent } from './components/rup/atomos/pesquisaNeonatal.component';
import { PercentiloCircunferenciaCefalicaNinoComponent } from './components/rup/atomos/percentiloCircunferenciaCefalicaNino.component';
import { PercentiloTallaComponent } from './components/rup/atomos/percentiloTalla.component';
import { DesarrolloMotorComponent } from './components/rup/atomos/desarrolloMotor.component';
import { ActitudAnteLosCuidadosComponent } from './components/rup/atomos/actitudAnteLosCuidados.component';
import { ControlDeEsfinteresComponent } from './components/rup/atomos/controlDeEsfinteres.component';
import { DesarrolloIntelectualyJuegosComponent } from './components/rup/atomos/desarrolloIntelectualyJuegos.component';
import { EscalaDeDesarrolloComponent } from './components/rup/moleculas/escala-de-desarrollo/escalaDeDesarrollo.component';
import { FactoresDeRiesgoNinoSanoComponent } from './components/rup/atomos/factores-riesgo/factoresDeRiesgoNinoSano.component';
import { IndiceDeMasaCorporalComponent } from './components/rup/moleculas/indice-de-masa-corporal/indiceDeMasaCorporal.component';

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
// Perinatales Parto
import { PartoViaVaginalComponent } from './components/rup/atomos/perinatales-parto/partoViaVaginal.component';
import { PartoViaVaginalForcepsComponent } from './components/rup/atomos/perinatales-parto/partoViaVaginalForceps.component';
import { PartoVaginalAsistidoExtractorVacioComponent } from './components/rup/atomos/perinatales-parto/partoVaginalAsistidoExtractorVacio.component';
import { PartoCesareaComponent } from './components/rup/atomos/perinatales-parto/partoCesarea.component';
import { HallazgoRelacionadoPartoComponent } from './components/rup/atomos/perinatales-parto/hallazgoRelacionadoParto.component';
// NIÑO SANO
import { OdontologiaComponent } from './components/rup/atomos/odontologia.component';
import { EstadoNutricionalComponent } from './components/rup/atomos/estadoNutricional.component';

// NO VA tslint:disable-next-line:max-line-length
import { ConsultaGeneralClinicaMedicaComponent } from './components/rup/moleculas/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
import { ObservacionesComponent } from './components/rup/atomos/observaciones.component';

// Servicios RUP //
import { TipoPrestacionService } from './services/tipoPrestacion.service';
import { TipoProblemaService } from './services/rup/tipoProblema.service';
import { ProblemaPacienteService } from './services/rup/problemaPaciente.service';
import { PrestacionPacienteService } from './services/rup/prestacionPaciente.service';

// Fin Servicios RUP //


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
    EvolucionProblemaComponent,
    EvolucionTodosProblemasComponent,
    PuntoInicioComponent,
    PrestacionEjecucionComponent,
    ResumenComponent,
    HeaderPacienteComponent,
    PrestacionValidacionComponent,
    EdadGestacionalFetalComponent,
    ViviendaAsistenciaEconomicaComponent,
    ViviendaCombustionComponent,
    ViviendaContaminantesComponent,
    ViviendaFamiliaComponent,
    ViviendaNivelInstruccionComponent,
    ViviendaPisoComponent,
    ViviendaResiduosComponent,
    ViviendaSituacionSocioEconomicaComponent,
    ViviendaSostenEconomicoComponent,
    ViviendaCondicionesAlojamientoComponent,
    PerinatalesEmbarazoNormalComponent,
    PerinatalesEmbarazoAnormalComponent,
    PerinatalesNumeroGestaComponent,
    PerinatalesGestacionMultipleComponent,
    ScoreApgarComponent,
    EdadGestacionalComponent,
    PartoViaVaginalComponent,
    PartoVaginalAsistidoExtractorVacioComponent,
    PartoViaVaginalForcepsComponent,
    PartoCesareaComponent,
    HallazgoRelacionadoPartoComponent,
    TransformarProblemaComponent,
    PesquisaNeonatalComponent,
    PruebaOtoemisionesAcusticasComponent,
    PercentiloTallaComponent,
    PercentiloCircunferenciaCefalicaNinoComponent,
    DesarrolloMotorComponent,
    ActitudAnteLosCuidadosComponent,
    ControlDeEsfinteresComponent,
    DesarrolloIntelectualyJuegosComponent,
    EscalaDeDesarrolloComponent,
    EstadoNutricionalComponent,
    OdontologiaComponent,
    IndiceDeMasaCorporalComponent

    // NO VAPacienteComponent
];

@NgModule({
    declarations: [
        RupComponent,
        ...RUP_COMPONENTS
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        PlexModule,
        routing
    ],
    exports: RUP_COMPONENTS,
    // [Andrrr] 2017-02-07: Requerido para poder crear componentes dinámicamente (Angular RC5-7)
    entryComponents: RUP_COMPONENTS,
    // bootstrap: [
    //     PuntoInicioComponent
    // ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },
        // PacienteService,
        // appRoutingProviders,
        // Plex,
        // Server,
        // PrestacionPacienteService,
        // ProblemaPacienteService,
        // TipoProblemaService,
        // TipoPrestacionService,

    ]
})
export class RupModule { debugger; }