import { ViviendaResiduosComponent } from './components/rup/viviendaResiduos.component';
import { ViviendaAsistenciaEcComponent } from './components/rup/viviendaAsistenciaEc.component';
import { ViviendaPisoComponent } from './components/rup/viviendaPiso.component';
import { ViviendaContaminantesComponent } from './components/rup/viviendaContaminantes.component';
import { ViviendaCombustionComponent } from './components/rup/viviendaCombustion.component';

//import { RUP_COMPONENTS } from './rup.module';
// RUP
import {
  RupComponent
} from './components/rup/rup.component';
//import { RupModule } from './rup.module';

import {
  ClonarAgendaComponent
} from './components/turnos/clonar-agenda';
import {
  AgendaComponent
} from './components/turnos/agenda.component';
import {
  EspacioFisicoService
} from './services/turnos/espacio-fisico.service';
import {
  PrestacionService
} from './services/turnos/prestacion.service';
import {
  AgendaService
} from './services/turnos/agenda.service';
import {
  TurnoService
} from './services/turnos/turno.service';
import {
  SmsService
} from './services/turnos/sms.service';
import {
  EspacioFisicoComponent
} from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import {
  EditEspacioFisicoComponent
} from './components/turnos/configuracion/espacio-fisico/edit-espacio-fisico.component';

import {
  BuscarAgendasComponent
} from './components/turnos/buscar-agendas.component';
import {
  DarTurnosComponent
} from './components/turnos/dar-turnos/dar-turnos.component';
import {
  GestorAgendasComponent
} from './components/turnos/gestor-agendas.component';
import {
  CalendarioComponent
} from './components/turnos/dar-turnos/calendario.component';
import {
  TurnosComponent
} from './components/turnos/turnos.component';
import {
  VistaAgendaComponent
} from './components/turnos/vista-agenda.component';
import {
  PanelEspacioComponent
} from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';


import {
  PrestacionComponent
} from './components/turnos/configuracion/prestacion/prestacion.component';
import {
  PrestacionCreateComponent
} from './components/turnos/configuracion/prestacion/prestacion-create.component';
import {
  PrestacionUpdateComponent
} from './components/turnos/configuracion/prestacion/prestacion-update.component';

import {
  ConfigPrestacionService
} from './services/turnos/configPrestacion.service';
import {
  HttpModule
} from '@angular/http';
import {
  InicioComponent
} from './components/inicio/inicio.component';

import {
  ProfesionalComponent
} from './components/profesional/profesional.component';
import {
  ProfesionalCreateUpdateComponent
} from './components/profesional/profesional-create-update.component';

import {
  EspecialidadComponent
} from './components/especialidad/especialidad.component';
import {
  EspecialidadCreateUpdateComponent
} from './components/especialidad/especialidad-create-update.component';

import {
  OrganizacionComponent
} from './components/organizacion/organizacion.component';
import {
  OrganizacionCreateUpdateComponent
} from './components/organizacion/organizacion-create-update.component';

import {
  ListaEsperaCreateUpdateComponent
} from './components/turnos/lista-espera/listaEspera-create-update.component';
import {
  ListaEsperaComponent
} from './components/turnos/lista-espera/listaEspera.component';

// Componentes MPI
import {
  PacienteComponent
} from './components/paciente/paciente.component';
import {
  PacienteSearchComponent
} from './components/paciente/paciente-search.component';
import {
  PacienteCreateUpdateComponent
} from './components/paciente/paciente-create-update.component';
import {
  PacienteUpdateComponent
} from './components/paciente/paciente-update.component';
// Fin Componentes MPI

//RUP

import {
  HeaderPacienteComponent
} from './components/paciente/headerPaciente.component';

import {
  PrestacionValidacionComponent
} from './components/rup/ejecucion/prestacionValidacion.component';
import {
  PesoComponent
} from './components/rup/peso.component';
import {
  SaturacionOxigenoComponent
} from './components/rup/saturacionOxigeno.component';
import {
  TallaComponent
} from './components/rup/talla.component';
import {
  TemperaturaComponent
} from './components/rup/temperatura.component';
import {
  FrecuenciaCardiacaComponent
} from './components/rup/frecuenciaCardiaca.component';
import {
  FrecuenciaRespiratoriaComponent
} from './components/rup/frecuenciaRespiratoria.component';
import {
  TensionSistolicaComponent
} from './components/rup/tensionSistolica.component';
import {
  TensionDiastolicaComponent
} from './components/rup/tensionDiastolica.component';
import {
  SignosVitalesComponent
} from './components/rup/signos-vitales/signosVitales.component';
import {
  TensionArterialComponent
} from './components/rup/tension-arterial/tensionArterial.component';
import {
  PrestacionEjecucionComponent
} from './components/rup/ejecucion/prestacionEjecucion.component';
import {
  ResumenComponent
} from './components/rup/ejecucion/resumen.component';
import {
  EvolucionTodosProblemasComponent
} from './components/rup/ejecucion/evolucionTodosProblemas.component';
import {
  EvolucionProblemaComponent
} from './components/rup/ejecucion/evolucionProblema.component';
import {
  ConsultaGeneralClinicaMedicaComponent
} from './components/rup/consulta-general-clinica-medica/consultaGeneralClinicaMedica.component';
import {
  ObservacionesComponent
} from './components/rup/observaciones.component';

// Servicios RUP //
import {
  TipoPrestacionService
} from './services/tipoPrestacion.service';
import {
  TipoProblemaService
} from './services/rup/tipoProblema.service';
import {
  ProblemaPacienteService
} from './services/rup/problemaPaciente.service';
import {
  PrestacionPacienteService
} from './services/rup/prestacionPaciente.service';
import {
  PuntoInicioComponent
} from './components/rup/ejecucion/puntoInicio.component';
import {
  EdadGestacionalComponent
} from './components/rup/edadGestacional.component';
import {
  ScoreApgarComponent
} from './components/rup/scoreApgar.component';
import { 
  NacimientoComponent 
} from './components/rup/nacimiento/nacimiento.component';

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
  EdadGestacionalComponent,
  ScoreApgarComponent,
  NacimientoComponent,
  ViviendaCombustionComponent,
  ViviendaContaminantesComponent,
  ViviendaResiduosComponent,
  ViviendaPisoComponent,
  ViviendaAsistenciaEcComponent

  // NO VAPacienteComponent
];



//fin rup

import {
  OrganizacionService
} from './services/organizacion.service';
import {
  ProfesionalService
} from './services/profesional.service';
import {
  EspecialidadService
} from './services/especialidad.service';
import {
  BarrioService
} from './services/barrio.service';
import {
  LocalidadService
} from './services/localidad.service';
import {
  PaisService
} from './services/pais.service';
import {
  PacienteService
} from './services/paciente.service';
import {
  TipoEstablecimientoService
} from './services/tipoEstablecimiento.service';
import {
  ProvinciaService
} from './services/provincia.service';
import {
  FinanciadorService
} from './services/financiador.service';
import {
  ListaEsperaService
} from './services/turnos/listaEspera.service';

import {
  NgModule
} from '@angular/core';
import {
  BrowserModule
} from '@angular/platform-browser';
import {
  AppComponent
} from './app.component';
import {
  LOCALE_ID
} from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  routing,
  appRoutingProviders
} from './app.routing';

import {
  DataTableModule,
  SharedModule
} from 'primeng/primeng';
import {
  ToggleButtonModule
} from 'primeng/primeng';

import {
  PlexModule
} from 'andes-plex/src/lib/module';
import {
  Plex
} from 'andes-plex/src/lib/core/service';
import {
  Server
} from 'andes-shared/src/lib/server/server.service';


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    DataTableModule,
    SharedModule,
    ToggleButtonModule,
    PlexModule,
    routing,
    //RupModule
  ],

  declarations: [
    AppComponent, InicioComponent,
    OrganizacionComponent, OrganizacionCreateUpdateComponent,
    ProfesionalComponent, ProfesionalCreateUpdateComponent,
    ProfesionalCreateUpdateComponent,
    EspecialidadComponent, EspecialidadCreateUpdateComponent,
    PacienteCreateUpdateComponent, PacienteComponent, PacienteUpdateComponent, PacienteSearchComponent,
    AgendaComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, PanelEspacioComponent,
    PrestacionComponent, PrestacionCreateComponent, PrestacionUpdateComponent,
    BuscarAgendasComponent, DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
    TurnosComponent, VistaAgendaComponent, ClonarAgendaComponent,
    ListaEsperaComponent, ListaEsperaCreateUpdateComponent,
    RupComponent,
    ...RUP_COMPONENTS
  ],
  entryComponents: RUP_COMPONENTS,
  bootstrap: [AppComponent],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'es-AR'
  },
    Plex,
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
    PrestacionService,
    appRoutingProviders,
    ConfigPrestacionService,
    AgendaComponent,
    EspacioFisicoComponent,
    AgendaService,
    TurnoService,
    EspacioFisicoService,
    ListaEsperaService,
    Server,
    SmsService,
    PrestacionPacienteService,
    ProblemaPacienteService,
    TipoProblemaService,
    TipoPrestacionService,


  ]

})

export class AppModule { }
