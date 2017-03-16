
/*
@jgabriel | 04-03-2017

¡ATENCION EQUIPO!
Siguiendo las guías de estilo de Angular (https://angular.io/styleguide) dejemos ordenados los imports
de la siguiente manera:

1) Módulos principales de Angular
2) Módulos globales
3) Servicios
4) Componentes
5) Otros
*/

// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Globales
import { PlexModule } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';

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
import { ListaEsperaService } from './services/turnos/listaEspera.service';

// ... Turnos
import { TurnosComponent } from './components/turnos/turnos.component';
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { PrestacionService } from './services/turnos/prestacion.service';
import { AgendaService } from './services/turnos/agenda.service';
import { TurnoService } from './services/turnos/turno.service';
import { SmsService } from './services/turnos/sms.service';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
import { TipoPrestacionService } from './services/tipoPrestacion.service';
// ... RUP
import { TipoProblemaService } from './services/rup/tipoProblema.service';
import { ProblemaPacienteService } from './services/rup/problemaPaciente.service';
import { PrestacionPacienteService } from './services/rup/prestacionPaciente.service';

// Componentes
// ... Tablas Maestras
import { InicioComponent } from './components/inicio/inicio.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { OrganizacionCreateUpdateComponent } from './components/organizacion/organizacion-create-update.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { TipoPrestacionCreateUpdateComponent } from './components/tipoPrestacion/tipoPrestacion-create-update.component';
// ... MPI
import { PacienteComponent } from './components/paciente/paciente.component';
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { PacienteCreateUpdateComponent } from './components/paciente/paciente-create-update.component';
import { PacienteUpdateComponent } from './components/paciente/paciente-update.component';
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
// ... Turnos
import { ClonarAgendaComponent } from './components/turnos/clonar-agenda';
import { AgendaComponent } from './components/turnos/agenda.component';
import { BuscarAgendasComponent } from './components/turnos/buscar-agendas.component';
import { DarTurnosComponent } from './components/turnos/dar-turnos/dar-turnos.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas.component';
import { CalendarioComponent } from './components/turnos/dar-turnos/calendario.component';
import { VistaAgendaComponent } from './components/turnos/vista-agenda.component';
import { PanelEspacioComponent } from './components/turnos/configuracion/espacio-fisico/panel-espacio.component';
import { ListaEsperaCreateUpdateComponent } from './components/turnos/lista-espera/listaEspera-create-update.component';
import { ListaEsperaComponent } from './components/turnos/lista-espera/listaEspera.component';
import { LiberarTurnoComponent } from './components/turnos/liberar-turno.component';
import { SuspenderTurnoComponent } from './components/turnos/suspender-turno.component';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { EditEspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/edit-espacio-fisico.component';

import { AgregarNotaTurnoComponent } from './components/turnos/agregar-nota-turno.component';

// Estos componentes utilizan ng-prime y deben ser actualizados
// import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';
// import { PrestacionCreateComponent } from './components/turnos/configuracion/prestacion/prestacion-create.component';
// import { PrestacionUpdateComponent } from './components/turnos/configuracion/prestacion/prestacion-update.component';

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
import { EvolucionTodosProblemasComponent } from './components/rup/problemas-paciente/evolucionTodosProblemas.component';
import { EvolucionProblemaComponent } from './components/rup/problemas-paciente/evolucionProblema.component';
import { EnmendarProblemaComponent } from './components/rup/problemas-paciente/enmendarProblema.component';
import { TransformarProblemaComponent } from './components/rup/problemas-paciente/transformarProblema.component';
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
  PruebaOtoemisionesAcusticasComponent,
  PesquisaNeonatalComponent,
  PercentiloTallaComponent,
  PercentiloCircunferenciaCefalicaNinoComponent,
  DesarrolloMotorComponent,
  ActitudAnteLosCuidadosComponent,
  ControlDeEsfinteresComponent,
  DesarrolloIntelectualyJuegosComponent,
  EscalaDeDesarrolloComponent

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
    routing,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    })
  ],

  declarations: [
    AppComponent, InicioComponent,
    OrganizacionComponent, OrganizacionCreateUpdateComponent,
    ProfesionalComponent, ProfesionalCreateUpdateComponent,
    ProfesionalCreateUpdateComponent,
    EspecialidadComponent, EspecialidadCreateUpdateComponent,
    PacienteCreateUpdateComponent, PacienteComponent, PacienteUpdateComponent, PacienteSearchComponent,
    AgendaComponent, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent,
    // PrestacionComponent, PrestacionCreateComponent, PrestacionUpdateComponent,
    TipoPrestacionComponent, TipoPrestacionCreateUpdateComponent,
    BuscarAgendasComponent, DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
    TurnosComponent, VistaAgendaComponent, ClonarAgendaComponent,
    ListaEsperaComponent, ListaEsperaCreateUpdateComponent,
    RupComponent, LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent,
    ...RUP_COMPONENTS
  ],
  entryComponents: RUP_COMPONENTS,
  bootstrap: [AppComponent],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'es-AR'
  },
    Plex,
    Auth,
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
    // EspacioFisicoComponent,
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
