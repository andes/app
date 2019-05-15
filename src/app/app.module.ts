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
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Global
import { PlexModule } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { AuthModule } from '@andes/auth';
import { Auth } from '@andes/auth';
import { RoutingGuard, RoutingNavBar } from './app.routings-guard.class';
import { AgmCoreModule } from '@agm/core';
import { MapsComponent } from './utils/mapsComponent';
import { PermisosComponent } from './utils/permisos/permisos.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { HoverClassDirective } from './directives/hover-class.directive';
import { DocumentosService } from './services/documentos.service';

// Pipes
import { EdadPipe } from './pipes/edad.pipe';
import { ProfesionalPipe } from './pipes/profesional.pipe';
import { FromNowPipe } from './pipes/fromNow.pipe';
import { FechaPipe } from './shared/pipes/fecha.pipe';
import { HoraPipe } from './shared/pipes/hora.pipe';
import { PacientePipe } from './pipes/paciente.pipe';
import { SexoPipe } from './pipes/sexo.pipe';
import { OrganizacionPipe } from './pipes/organizacion.pipe';
import { SortBloquesPipe } from './pipes/agenda-bloques.pipe';
import { TextFilterPipe } from './pipes/textFilter.pipe';
import { FilterPermisos } from './pipes/filterPermisos.pipe';
import { EnumerarPipe } from './pipes/enumerar.pipe';
import { PluralizarPipe } from './pipes/pluralizar.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { IconoCamaPipe } from './pipes/iconoCama.pipe';
import { RelacionRUPPipe } from './pipes/relacionRUP.pipe';
import { Html2TextPipe } from './pipes/html2text.pipe';

// Servicios
// ... Tablas Maestras
import { OrganizacionService } from './services/organizacion.service';
import { OcupacionService } from './services/ocupacion/ocupacion.service';
import { ProfesionalService } from './services/profesional.service';
import { EspecialidadService } from './services/especialidad.service';
import { BarrioService } from './services/barrio.service';
import { LocalidadService } from './services/localidad.service';
import { PaisService } from './services/pais.service';
import { PacienteService } from './core/mpi/services/paciente.service';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { FinanciadorService } from './services/financiador.service';
import { ParentescoService } from './services/parentesco.service';
import { ListaEsperaService } from './services/turnos/listaEspera.service';
import { LogService } from './services/log.service';
import { LogPacienteService } from './services/logPaciente.service';
import { PermisosService } from './services/permisos.service';
import { PrestamosService } from './services/prestamosHC/prestamos-hc.service';
import { RenaperService } from './services/fuentesAutenticas/servicioRenaper.service';
import { ConfiguracionPrestacionService } from './services/term/configuracionPrestacion.service';
import { PrestacionLegacyService } from './services/prestacionLegacy.service';

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
import { ReglasComponent } from './components/top/reglas/reglas.component';
import { VisualizacionReglasComponent } from './components/top/reglas/visualizacionReglas.component';
import { ReglaService } from './services/top/reglas.service';
import { FacturacionAutomaticaService } from './services/facturacionAutomatica.service';
import { PeriodoPadronesPucoService } from './services/periodoPadronesPuco.service';
import { PeriodoPadronesProfeService } from './services/periodoPadronesProfe.service';


// TOP
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
import { CDAService } from './modules/rup/services/CDA.service';
import { ResumenPacienteDinamicoService } from './modules/rup/services/resumenPaciente-dinamico.service';
import { VacunasService } from './services/vacunas.service';




// Componentes
import { LoginComponent } from './components/login/login.component';
import { SelectOrganizacionComponent } from './components/login/selectOrganizacion.component';
import { InicioComponent } from './components/inicio/inicio.component';

// Sugerencias
import { SugerenciasService } from './services/sendmailsugerencias.service';

// ... Tablas Maestras
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateUpdateComponent } from './components/profesional/profesional-create-update.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateUpdateComponent } from './components/especialidad/especialidad-create-update.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { OrganizacionCreateUpdateComponent } from './components/organizacion/organizacion-create-update.component';
import { CamaCreateUpdateComponent } from './apps/rup/internacion/components/cama-create-update.component';
import { CamasListadoComponent } from './apps/rup/internacion/components/camasListado.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { TipoPrestacionCreateUpdateComponent } from './components/tipoPrestacion/tipoPrestacion-create-update.component';
import { ProcedimientosQuirurgicosService } from './services/procedimientosQuirurgicos.service';
import { SectoresItemComponent } from './components/organizacion/sectores-item/sectores-item.component';
// ... MPI
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { DashboardComponent } from './components/paciente/dashboard.component';
import { PacienteDetalleComponent } from './components/paciente/paciente-detalle';

import { PacienteBuscarComponent } from './modules/mpi/components/paciente-buscar.component';
import { PacienteListadoComponent } from './modules/mpi/components/paciente-listado.component';
import { PacientePanelComponent } from './modules/mpi/components/paciente-panel.component';
import { ExtranjeroNNCruComponent } from './core/mpi/components/extranjero-nn-cru.component';
import { RelacionesPacientesComponent } from './core/mpi/components/relaciones-pacientes.component';
import { BusquedaMpiComponent } from './core/mpi/components/busqueda-mpi.component';
import { PacienteCruComponent } from './core/mpi/components/paciente-cru.component';
import { GoogleMapComponent } from './core/mpi/components/google-map.component';
import { GeoreferenciaService } from './core/mpi/services/georeferencia.service';
import { BotonesRegistroComponent } from './core/mpi/components/mpi-botones-registro.component';


// PUCO/ObraSocial
import { PucoComponent } from './components/puco/puco.component';


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
import { DetalleAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/detalle-agenda.component';
import { CarpetaPacienteComponent } from './components/carpeta-paciente/carpeta-paciente.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { RevisionFueraAgendaComponent } from './components/turnos/gestor-agendas/revision/fuera-agenda.component';

import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { TurnosPacienteComponent } from './components/turnos/punto-inicio/turnos-paciente.component';
import { DashboardCodificacionComponent } from './components/turnos/dashboard/dashboard-codificacion.component';
import { ActivarAppComponent } from './components/turnos/punto-inicio/activar-app.component';
import { SolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/solicitud-turno-ventanilla.component';
import { ListaSolicitudTurnoVentanillaComponent } from './components/turnos/punto-inicio/solicitud-turno-ventanilla/lista-solicitud-turno-ventanilla.component';
import { ListarTurnosComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-turnos.component';
import { ListarCarpetasComponent } from './components/turnos/gestor-agendas/operaciones-agenda/listar-carpetas.component';
import { MapaEspacioFisicoComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico.component';
import { SuspenderAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/suspender-agenda.component';
import { ArancelamientoFormComponent } from './components/turnos/punto-inicio/arancelamiento/arancelamiento-form.component';
import { AutocitarTurnoAgendasComponent } from './components/turnos/autocitar/autocitar.component';
import { DinamicaFormComponent } from './components/turnos/autocitar/dinamica.component';
import { MapaEspacioFisicoVistaComponent } from './components/turnos/configuracion/mapa-espacio-fisico/mapa-espacio-fisico-vista.component';
import { BuscadorCie10Component } from './components/turnos/gestor-agendas/operaciones-agenda/buscador-cie10.component';
import { UpdateContactoDireccionComponent } from './components/turnos/dashboard/update-contacto-direccion.component';


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
import { PrestacionValidacionComponent } from './modules/rup/components//ejecucion/prestacionValidacion.component';
import { PrestacionEjecucionComponent } from './modules/rup/components//ejecucion/prestacionEjecucion.component';
import { PuntoInicioComponent } from './modules/rup/components/ejecucion/puntoInicio.component';
import { VistaHudsComponent } from './modules/rup/components/ejecucion/vistaHuds.component';
import { VistaPrestacionComponent } from './modules/rup/components/huds/vistaPrestacion';
import { VistaCDAComponent } from './modules/rup/components/huds/vistaCDA.component';
import { HudsBusquedaPacienteComponent } from './modules/rup/components/ejecucion/hudsBusquedaPaciente.component';
import { ResumenPacienteEstaticoComponent } from './modules/rup/components/ejecucion/resumen-paciente/resumenPaciente-estatico.component';
import { ResumenPacienteDinamicoComponent } from './modules/rup/components/ejecucion/resumen-paciente/resumenPaciente-dinamico.component';
import { ResumenPacienteDinamicoNinoComponent } from './modules/rup/components/ejecucion/resumen-paciente/resumenPaciente-dinamico-nino.component';


// Legacy para RUP
// TODO: ver con JGabriel!!!
import { SelectPorRefsetComponent } from './modules/rup/components/elementos/SelectPorRefset.component';
import { TensionSistolicaComponent } from './modules/rup/components/elementos/tensionSistolica.component';
import { TensionDiastolicaComponent } from './modules/rup/components/elementos/tensionDiastolica.component';
import { TensionArterialComponent } from './modules/rup/components/elementos/tensionArterial.component';
import { TemperaturaComponent } from './modules/rup/components/elementos/temperatura.component';
import { SolicitudPrestacionDefaultComponent } from './modules/rup/components/elementos/solicitudPrestacionDefault.component';
import { SignosVitalesComponent } from './modules/rup/components/elementos/signosVitales.component';
import { SaturacionOxigenoComponent } from './modules/rup/components/elementos/saturacionOxigeno.component';
import { FrecuenciaCardiacaComponent } from './modules/rup/components/elementos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './modules/rup/components/elementos/frecuenciaRespiratoria.component';
import { ObservacionesComponent } from './modules/rup/components/elementos/observaciones.component';
import { NuevaEvolucionProblemaComponent } from './modules/rup/components/elementos/nuevaEvolucionProblema.component';
import { EvolucionProblemaDefaultComponent } from './modules/rup/components/elementos/evolucionProblemaDefault.component';
import { AutocitadoComponent } from './modules/rup/components/elementos/autocitado.component';
import { ObesidadComponent } from './modules/rup/components/elementos/obesidad.component';
import { HipertensionArterialComponent } from './modules/rup/components/elementos/hipertensionArterial.component';
import { FiltradoGlomerularComponent } from './modules/rup/components/elementos/filtradoGlomerular.component';
import { AdjuntarDocumentoComponent } from './modules/rup/components/elementos/adjuntarDocumento.component';
import { RegistrarMedicamentoDefaultComponent } from './modules/rup/components/elementos/registrarMedicamentoDefault.component';
import { InformesComponent } from './modules/rup/components/elementos/informe.component';
import { IngresoInternacionComponent } from './modules/rup/components/elementos/ingresoInternacion.component';
import { OtoemisionAcusticaDeOidoDerechoComponent } from './modules/rup/components/elementos/otoemisionAcusticaDeOidoDerecho.component';
import { OtoemisionAcusticaDeOidoIzquierdoComponent } from './modules/rup/components/elementos/otoemisionAcusticaDeOidoIzquierdo.component';
import { OdontogramaRefsetComponent } from './modules/rup/components/elementos/OdontogramaRefset.component';
import { LactanciaComponent } from './modules/rup/components/elementos/lactancia.component';
import { IniciarInternacionComponent } from './apps/rup/internacion/components/iniciarInternacion.component';
import { OcuparCamaComponent } from './apps/rup/internacion/components/cama-ocupar.component';
import { PasesCamaComponent } from './modules/rup/components/elementos/pasesCama.component';
import { CensoDiarioComponent } from './apps/rup/internacion/components/censoDiario.component';
import { CensoMensualComponent } from './apps/rup/internacion/components/censoMensual.component';
import { ElementoDeRegistroComponent } from './modules/rup/components/elementos/elementoDeRegistro.component';
import { InformeEpicrisisComponent } from './modules/rup/components/elementos/informeEpicrisis.component';
import { OdontologiaDefaultComponent } from './modules/rup/components/elementos/odontologiaDefault.component';
import { CircunferenciaCinturaComponent } from './modules/rup/components/elementos/circunferenciaCintura.component';
import { InformeActividadNoNominalizadaComponent } from './modules/rup/components/elementos/informeActividadNoNominalizada.component';

import { GraficoLinealComponent } from './modules/rup/components/elementos/graficoLineal.component';
import { PesoComponent } from './modules/rup/components/elementos/peso.component';
import { PercentiloPesoComponent } from './modules/rup/components/elementos/percentiloPeso.component';
import { TallaComponent } from './modules/rup/components/elementos/talla.component';
import { PercentiloTallaComponent } from './modules/rup/components/elementos/percentiloTalla.component';
import { PerimetroCefalicoComponent } from './modules/rup/components/elementos/perimetroCefalico.component';
import { IndiceDeMasaCorporalComponent } from './modules/rup/components/elementos/indiceDeMasaCorporal.component';
import { PercentiloDeMasaCorporalComponent } from './modules/rup/components/elementos/percentiloDeMasaCorporal.component';
import { PercentiloPerimetroCefalicoComponent } from './modules/rup/components/elementos/percentiloPerimetroCefalico.component';
import { TensionArterialPediatricaComponent } from './modules/rup/components/elementos/tensionArterialPediatrica.component';
import { PercentiloDeTensionArterialComponent } from './modules/rup/components/elementos/percentiloDeTensionArterial.component';
import { ConsultaDeNinoSanoM2AComponent } from './modules/rup/components/elementos/consultaDeNinoSanoM2A.component';
import { ConsultaDeNinoSanoE2Y3AComponent } from './modules/rup/components/elementos/consultaDeNinoSanoE2Y3A.component';
import { ConsultaDeNinoSanoE3Y6AComponent } from './modules/rup/components/elementos/consultaDeNinoSanoE3Y6A.component';
import { DesarrolloPsicomotorComponent } from './modules/rup/components/elementos/desarrolloPsicomotor.component';
import { RegistrarMedidasAntropometricasNinoE3Y6AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoE3Y6A.component';
import { RegistrarMedidasAntropometricasNinoM2AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoM2A.component';
import { RegistrarMedidasAntropometricasNinoE2Y3AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoE2Y3A.component';
import { ResumenHistoriaClinicaComponent } from './modules/rup/components/elementos/resumenHistoriaClinica.component';
import { CalculoDeBostonComponent } from './modules/rup/components/elementos/calculoDeBoston.component';
import { SeleccionBinariaComponent } from './modules/rup/components/elementos/seleccionBinaria.component';
import { ValorNumericoComponent } from './modules/rup/components/elementos/valorNumerico.component';
import { MoleculaBaseComponent } from './modules/rup/components/elementos/moleculaBase.component';
import { ProcedimientoDeEnfermeriaComponent } from './modules/rup/components/elementos/procedimientoDeEnfermeria.component';

// TODO: Eliminar todo esto de las llaves: deprecated
import { LlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/llaves-tipoPrestacion.component';
import { EditarLlavesTipoPrestacionComponent } from './components/llaves/tipoPrestacion/editar-llaves-tipoPrestacion.component';

// ... Auditoría RUP (prestacionPaciente)
import { AuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/auditoria-prestacionPaciente.component';
import { EditarAuditoriaPrestacionPacienteComponent } from './components/auditoria/prestacionPaciente/editar-auditoria-prestacionPaciente.component';


// AUDITORIA
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { VincularPacientesComponent } from './components/auditoria/vincular-pacientes.component';
// import { AuditoriaPorBloqueComponent } from './components/auditoria/auditoriaPorBloque.component';

// USUARIO
import { BusquedaUsuarioComponent } from './components/usuario/busquedaUsuario.component';
import { UsuarioCreateComponent } from './components/usuario/usuarioCreate.component';
import { UsuarioUpdateComponent } from './components/usuario/usuarioUpdate.component';
import { ArbolPermisosComponent } from './components/usuario/arbolPermisos.component';

// REPORTES
import { ReporteC2Component } from './components/reportes/reporteC2.component';
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';

import { TurnosPrestacionesComponent } from './components/buscadorTurnosPrestaciones/turnos-prestaciones.component';
import { TurnosPrestacionesService } from './components/buscadorTurnosPrestaciones/services/turnos-prestaciones.service';


// REPORTES SJ
import { EncabezadoReportesDiariosComponent } from './components/reportesDiarios/encabezadoReportesDiarios.component';
import { ResumenDiarioMensualComponent } from './components/reportesDiarios/resumenDiarioMensual.component';
import { PlanillaC1Component } from './components/reportesDiarios/planillaC1.component';

// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';


// Libs
// import { ChartModule } from 'angular2-chartjs';
import { ChartsModule } from 'ng2-charts';

// INTERNACION

import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';
import { EjecucionInternacionComponent } from './apps/rup/internacion/components/ejecucionInternacion.component';

// Mapa de camas
import { MapaDeCamasComponent } from './apps/rup/internacion/components/mapa-de-camas.component';
import { CamaComponent } from './apps/rup/internacion/components/cama.component';
import { CamaEstadoComponent } from './apps/rup/internacion/components/camaEstado.component';
import { OrganizacionSectoresComponent } from './components/organizacion/organizacion-sectores.component';


// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';
import { DetalleSolicitudComponent } from './components/top/solicitudes/detalleSolicitud.component';
import { AuditarSolicitudComponent } from './components/top/solicitudes/auditarSolicitud.component';
import { NuevaSolicitudComponent } from './components/top/solicitudes/nuevaSolicitud.component';
import { AnularSolicitudComponent } from './components/top/solicitudes/anularSolicitud.component';

// Componentes RUP
// [jgabriel] Por alguna cuestión de Angular's DI no se puede tener esto en otro archivo. WTF?

// Préstamos HC
import { PrestamosHcComponent } from './components/prestamosHC/prestamos-hc.component';
import { ListarSolicitudesComponent } from './components/prestamosHC/solicitudes/listar-solicitudes.component';
import { ListarPrestamosComponent } from './components/prestamosHC/prestamos/listar-prestamos.component';
import { HistorialCarpetasComponent } from './components/prestamosHC/historial/historial-hc.component';
import { PrestarHcComponent } from './components/prestamosHC/solicitudes/prestar-hc.component';
import { DevolverHcComponent } from './components/prestamosHC/prestamos/devolver-hc.component';
import { ImprimirSolicitudesComponent } from './components/prestamosHC/solicitudes/imprimir-solicitudes.component';
import { SolicitudManualComponent } from './components/prestamosHC/solicitudes/solicitud-manual-hc.component';


import { EstadisticaModule } from './modules/estadisticas/estadistica.module';
// Configuracion prestaciones
import { ConfiguracionPrestacionVisualizarComponent } from './components/configuracionPrestacion/configuracion-prestacion-visualizar.component';
import { ConfiguracionPrestacionCrearComponent } from './components/configuracionPrestacion/configuracion-prestacion-crear.component';
import { CamasService } from './apps/rup/internacion/services/camas.service';
import { InternacionService } from './apps/rup/internacion/services/internacion.service';
import { DesocuparCamaComponent } from './apps/rup/internacion/components/cama-desocupar.component';
import { ListaEsperaInternacionComponent } from './apps/rup/internacion/components/listaEsperaInternacion.component';
import { EgresoInternacionComponent } from './apps/rup/internacion/components/egresoInternacion.component';
import { ResumenInternacionComponent } from './apps/rup/internacion/components/resumenInternacion.component';
import { CamaBloquearComponent } from './apps/rup/internacion/components/cama-bloquear.component';
import { CamaDesbloquearComponent } from './apps/rup/internacion/components/cama-desbloquear.component';
import { CamaPrepararComponent } from './apps/rup/internacion/components/cama-preparar.component';
import { ListadoInternacionComponent } from './apps/rup/internacion/components/listado-internacion.component';


import { RiesgoCardiovascularService } from './modules/rup/components/formulas/riesgoCardiovascular.service';
import { FormulaBaseService } from './modules/rup/components/formulas';
import { FormulaBaseComponent } from './modules/rup/components/elementos/FormulaBase.component';
// Campañas Salud
import { CampaniaSaludService } from './apps/campaniaSalud/services/campaniaSalud.service';
import { CampaniaSaludComponent } from './apps/campaniaSalud/components/campaniaSalud.component';
import { CampaniaVisualizacionComponent } from './apps/campaniaSalud/components/campaniaVisualizacion.component';
import { CampaniaFormComponent } from './apps/campaniaSalud/components/campania-create-update.component';

let RUPComponentsArray = [
    SelectPorRefsetComponent,
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
    PercentiloPerimetroCefalicoComponent,
    PerimetroCefalicoComponent,
    RegistrarMedicamentoDefaultComponent,
    SaturacionOxigenoComponent,
    GraficoLinealComponent,
    SignosVitalesComponent,
    SolicitudPrestacionDefaultComponent,
    TallaComponent,
    TemperaturaComponent,
    TensionArterialComponent,
    TensionDiastolicaComponent,
    TensionSistolicaComponent,
    AdjuntarDocumentoComponent,
    IngresoInternacionComponent,
    OtoemisionAcusticaDeOidoDerechoComponent,
    OtoemisionAcusticaDeOidoIzquierdoComponent,
    OdontogramaRefsetComponent,
    LactanciaComponent,
    IniciarInternacionComponent,
    PasesCamaComponent,
    CensoDiarioComponent,
    CensoMensualComponent,
    InformeEpicrisisComponent,
    ElementoDeRegistroComponent,
    OdontologiaDefaultComponent,
    CircunferenciaCinturaComponent,
    ResumenPacienteEstaticoComponent,
    ResumenPacienteDinamicoComponent,
    ResumenPacienteDinamicoNinoComponent,
    InformeActividadNoNominalizadaComponent,
    PercentiloPesoComponent,
    PercentiloTallaComponent,
    PercentiloDeMasaCorporalComponent,
    TensionArterialPediatricaComponent,
    PercentiloDeTensionArterialComponent,
    ConsultaDeNinoSanoM2AComponent,
    ConsultaDeNinoSanoE2Y3AComponent,
    ConsultaDeNinoSanoE3Y6AComponent,
    DesarrolloPsicomotorComponent,
    RegistrarMedidasAntropometricasNinoM2AComponent,
    RegistrarMedidasAntropometricasNinoE2Y3AComponent,
    RegistrarMedidasAntropometricasNinoE3Y6AComponent,
    ResumenHistoriaClinicaComponent,
    FormulaBaseComponent,
    CalculoDeBostonComponent,
    SeleccionBinariaComponent,
    ValorNumericoComponent,
    MoleculaBaseComponent,
    HeaderPacienteComponent,
    VistaRegistroComponent,
    VistaProcedimientoComponent,
    VistaPrestacionComponent,
    VistaContextoPrestacionComponent,
    ProcedimientoDeEnfermeriaComponent,
    CamaBloquearComponent,
    CamaDesbloquearComponent,
    CamaPrepararComponent,
    OcuparCamaComponent,
    EjecucionInternacionComponent,
    EgresoInternacionComponent
];

/** moment pipes  - desde agular 5 hay que importar el locale a demanda */
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { FormTerapeuticoService } from './services/formTerapeutico/formTerapeutico.service';
import { ArbolItemComponent } from './components/formularioTerapeutico/arbolItem.component';
import { FormTerapeuticoDetallePageComponent } from './components/formularioTerapeutico/form-terapeutico-detalle.component';
import { AddformTerapeuticoComponent } from './components/formularioTerapeutico/add-form-terapeutico';
import { BebeCruComponent } from './core/mpi/components/bebe-cru.component';
import { NotaComponent } from './core/mpi/components/notas-paciente.component';
import { PacienteCacheService } from './core/mpi/services/pacienteCache.service';
import { HistorialBusquedaService } from './core/mpi/services/historialBusqueda.service';
/** moment pipes  - desde agular 5 hay que importar el locale a demanda */
import { ChartComponent } from './modules/rup/components/elementos/chart.component';
import { UploadFileComponent } from './shared/components/upload-file.component';
import { CodificacionService } from './modules/rup/services/codificacion.service';
import { VistaRegistroComponent } from './modules/rup/components/huds/vistaRegistro';
import { VistaProcedimientoComponent } from './modules/rup/components/huds/vistaProcedimiento';
import { VistaContextoPrestacionComponent } from './modules/rup/components/huds/vistaContextoPrestacion';
import { PasesListadoInternacionComponent } from './apps/rup/internacion/components/pasesListadoInternacion.component';

import { SnomedBuscarService } from './components/snomed/snomed-buscar.service';
import { HUDSService } from './modules/rup/services/huds.service';
import { PreviousUrlService } from './services/previous-url.service';

registerLocaleData(localeEs, 'es');

// Main module
@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
        PlexModule,
        AuthModule,
        ScrollingModule,
        NgDragDropModule.forRoot(),
        ChartsModule,
        routing,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAJuFVuMmVwV8gtP_1m3Ll1VzHagAI_X9I'
        }),
    ],
    declarations: [
        AppComponent, InicioComponent, LoginComponent, SelectOrganizacionComponent,
        OrganizacionComponent, OrganizacionCreateUpdateComponent,
        CamaCreateUpdateComponent, CamasListadoComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent,
        ProfesionalCreateUpdateComponent,
        UploadFileComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        PacienteDetalleComponent, DashboardComponent,
        MapsComponent, EdadPipe, ProfesionalPipe, FromNowPipe, FechaPipe, HoraPipe, PacientePipe, SexoPipe, OrganizacionPipe, SortBloquesPipe, TextFilterPipe,
        FilterPermisos, EnumerarPipe, PluralizarPipe, IconoCamaPipe, ReplacePipe,
        PlanificarAgendaComponent, AutocitarTurnoAgendasComponent, DinamicaFormComponent, BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        Html2TextPipe, RelacionRUPPipe,
        PlanificarAgendaComponent, AutocitarTurnoAgendasComponent, BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        TipoPrestacionComponent, TipoPrestacionCreateUpdateComponent,
        DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent,
        ListaEsperaComponent, ListaEsperaCreateUpdateComponent, RevisionAgendaComponent, RevisionFueraAgendaComponent, PopoverAuditComponent,
        RUPComponent, LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        CarpetaPacienteComponent,
        ArancelamientoFormComponent,
        ReasignarTurnoComponent, ReasignarTurnoAutomaticoComponent, EstadisticasAgendasComponent, EstadisticasPacientesComponent,
        AuditoriaComponent,
        PermisosComponent, ArbolPermisosComponent,
        // AuditoriaPorBloqueComponent,
        PuntoInicioComponent,
        VincularPacientesComponent,
        LlavesTipoPrestacionComponent, EditarLlavesTipoPrestacionComponent,
        AuditoriaPrestacionPacienteComponent, EditarAuditoriaPrestacionPacienteComponent,
        HoverClassDirective, PuntoInicioTurnosComponent, ReasignarTurnoAgendasComponent,
        TurnosPacienteComponent, DashboardCodificacionComponent,
        SolicitudTurnoVentanillaComponent, ListaSolicitudTurnoVentanillaComponent, ActivarAppComponent,
        BusquedaUsuarioComponent, UsuarioCreateComponent, UsuarioUpdateComponent,
        ReporteC2Component,
        ConsultaDiagnosticoComponent,
        CantidadConsultaXPrestacionComponent,
        EncabezadoReportesComponent,
        ResumenDiarioMensualComponent, PlanillaC1Component, EncabezadoReportesDiariosComponent,
        ListarTurnosComponent, ListarCarpetasComponent,
        MapaEspacioFisicoComponent, SuspenderAgendaComponent,
        MapaEspacioFisicoVistaComponent,
        PrestacionCrearComponent,
        PrestacionEjecucionComponent,
        PrestacionValidacionComponent,
        SnomedBuscarComponent,
        DetalleAgendaComponent,
        HeaderPacienteComponent,
        HudsBusquedaComponent,
        BuscadorComponent,
        VistaHudsComponent,
        VistaPrestacionComponent,
        VistaCDAComponent,
        HudsBusquedaPacienteComponent,
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,

        // RUP
        ...RUPComponentsArray,
        MapaDeCamasComponent,
        CamaComponent,
        ListadoInternacionComponent,
        PasesListadoInternacionComponent,
        PuntoInicioInternacionComponent,
        ChartComponent,
        OrganizacionSectoresComponent,
        ResumenInternacionComponent,
        ListaEsperaInternacionComponent,
        VistaRegistroComponent,
        VistaProcedimientoComponent,
        VistaPrestacionComponent,
        VistaContextoPrestacionComponent,

        // Solicitudes
        SolicitudesComponent,
        DetalleSolicitudComponent,
        AuditarSolicitudComponent,
        AnularSolicitudComponent,
        NuevaSolicitudComponent,
        PrestamosHcComponent,
        ListarSolicitudesComponent,
        ListarPrestamosComponent,
        PrestarHcComponent,
        DevolverHcComponent,
        HistorialCarpetasComponent,
        ImprimirSolicitudesComponent,
        SolicitudManualComponent,
        CamaEstadoComponent,
        OcuparCamaComponent,
        DesocuparCamaComponent,
        OrganizacionSectoresComponent,
        SectoresItemComponent,
        PucoComponent,
        ReglasComponent,
        VisualizacionReglasComponent,
        // MPI
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,
        PacientePanelComponent,
        BebeCruComponent,
        ExtranjeroNNCruComponent,
        NotaComponent,
        RelacionesPacientesComponent,
        BusquedaMpiComponent,
        PacienteCruComponent,
        GoogleMapComponent,
        BotonesRegistroComponent,
        UpdateContactoDireccionComponent,

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

        // Buscador de turnos y prestaciones
        TurnosPrestacionesComponent,
    ],
    entryComponents: RUPComponentsArray,
    bootstrap: [AppComponent],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'es-AR'
        },
        Plex,
        Server,
        Auth,
        RoutingGuard,
        RoutingNavBar,
        OrganizacionService,
        OcupacionService,
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
        SmsService,
        PrestacionesService,
        AdjuntosService,
        TipoPrestacionService,
        ObraSocialService,
        ObraSocialCacheService,
        ProfeService,
        PeriodoPadronesPucoService,
        PeriodoPadronesProfeService,
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
        RenaperService,
        LogPacienteService,
        UsuarioService,
        PermisosService,
        FrecuentesProfesionalService,
        DocumentosService,
        CamasService,
        ProcedimientosQuirurgicosService,
        InternacionService,
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
        SeleccionBinariaComponent,
        CampaniaSaludService,
        SeleccionBinariaComponent,
        SnomedBuscarService,
        HUDSService,
        TurnosPrestacionesService,
        PreviousUrlService
    ]
})

export class AppModule { }
