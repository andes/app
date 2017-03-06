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
import { PlexModule } from 'andes-plex/src/lib/module';
import { Plex } from 'andes-plex/src/lib/core/service';

// Server
import { Server } from 'andes-shared/src/lib/server/server.service';

// Routing
import { routing, appRoutingProviders } from './app.routing';

// RUP
import { PrestacionValidacionComponent } from './components/rup/ejecucion/prestacionValidacion.component';
import { PesoComponent } from './components/rup/peso.component';
import { SaturacionOxigenoComponent } from './components/rup/saturacionOxigeno.component';
import { TallaComponent } from './components/rup/talla.component';
import { TemperaturaComponent } from './components/rup/temperatura.component';
import { FrecuenciaCardiacaComponent } from './components/rup/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './components/rup/frecuenciaRespiratoria.component';
import { TensionSistolicaComponent } from './components/rup/tensionSistolica.component';
import { TensionDiastolicaComponent } from './components/rup/tensionDiastolica.component';
import { SignosVitalesComponent } from './components/rup/signos-vitales/signosVitales.component';
import { TensionArterialComponent } from './components/rup/tension-arterial/tensionArterial.component';
 import { PrestacionEjecucionComponent } from './components/rup/ejecucion/prestacionEjecucion.component';
 import { PuntoInicioComponent } from './components/rup/ejecucion/puntoInicio.component';
 import { ResumenComponent } from './components/rup/ejecucion/resumen.component';
 import { EvolucionTodosProblemasComponent } from './components/rup/ejecucion/evolucionTodosProblemas.component';
 import { EvolucionProblemaComponent } from './components/rup/ejecucion/evolucionProblema.component';
 import { ViviendaSostenEconomicoComponent } from './components/rup/viviendaSostenEconomico.component';
import { ViviendaSituacionSocioEconomicaComponent } from './components/rup/viviendaSituacionSocioEconomica.component';
import { ViviendaResiduosComponent } from './components/rup/viviendaResiduos.component';
import { ViviendaPisoComponent } from './components/rup/viviendaPiso.component';
import { ViviendaNivelInstruccionComponent } from './components/rup/viviendaNivelInstruccion.component';
import { ViviendaFamiliaComponent } from './components/rup/viviendaFamilia.component';
import { ViviendaContaminantesComponent } from './components/rup/viviendaContaminantes.component';
import { ViviendaCombustionComponent } from './components/rup/viviendaCombustion.component';
import { ViviendaAsistenciaEconomicaComponent } from './components/rup/viviendaAsistenciaEconomica.component';
// NO VA tslint:disable-next-line:max-line-length
import { ConsultaGeneralClinicaMedicaComponent } from './components/rup/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
import { ObservacionesComponent } from './components/rup/observaciones.component';

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
     ViviendaAsistenciaEconomicaComponent,
     ViviendaCombustionComponent,
     ViviendaContaminantesComponent,
     ViviendaFamiliaComponent,
     ViviendaNivelInstruccionComponent,
     ViviendaPisoComponent,
     ViviendaResiduosComponent,
     ViviendaSituacionSocioEconomicaComponent,
     ViviendaSostenEconomicoComponent,
     
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
export class RupModule {debugger; }