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

// Global
import { PlexModule } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { AuthModule } from '@andes/auth';
import { Auth } from '@andes/auth';
import { RoutingGuard } from './app.routings-guard.class';
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
import { IconoCamaPipe } from './pipes/iconoCama.pipe';
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
import { PacienteService } from './services/paciente.service';
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
import { InternacionService } from './modules/rup/services/internacion.service';
import { CDAService } from './modules/rup/services/CDA.service';



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
import { CamaCreateUpdateComponent } from './modules/rup/components/internacion/mapa-de-camas/cama/cama-create-update.component';
import { CamasListadoComponent } from './modules/rup/components/internacion/mapa-de-camas/cama/camasListado.component';
import { TipoPrestacionComponent } from './components/tipoPrestacion/tipoPrestacion.component';
import { TipoPrestacionCreateUpdateComponent } from './components/tipoPrestacion/tipoPrestacion-create-update.component';
import { ProcedimientosQuirurgicosService } from './services/procedimientosQuirurgicos.service';
import { SectoresItemComponent } from './components/organizacion/sectores-item/sectores-item.component';
// ... MPI
import { PacienteSearchComponent } from './components/paciente/paciente-search.component';
import { PacienteCreateUpdateComponent } from './components/paciente/paciente-create-update.component';
import { HeaderPacienteComponent } from './components/paciente/headerPaciente.component';
import { DashboardComponent } from './components/paciente/dashboard.component';
import { PacienteDetalleComponent } from './components/paciente/paciente-detalle';
import { PacienteDetalleActualizarComponent } from './components/paciente/paciente-detalle-actualizar.component';
import { PacienteBuscarComponent } from './modules/mpi/components/paciente-buscar.component';
import { PacienteListadoComponent } from './modules/mpi/components/paciente-listado.component';
import { PacientePanelComponent } from './modules/mpi/components/paciente-panel.component';

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
import { CarpetaPacienteComponent } from './components/carpeta-paciente/carpeta-paciente.component';
import { GestorAgendasComponent } from './components/turnos/gestor-agendas/gestor-agendas.component';
import { AgregarNotaAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/nota-agenda.component';
import { AgregarSobreturnoComponent } from './components/turnos/gestor-agendas/operaciones-agenda/sobreturno.component';
import { PanelAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/panel-agenda.component';
import { BotonesAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/botones-agenda.component';
import { RevisionAgendaComponent } from './components/turnos/gestor-agendas/operaciones-agenda/revision-agenda.component';
import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { PuntoInicioTurnosComponent } from './components/turnos/punto-inicio/puntoInicio-turnos.component';
import { EstadisticasAgendasComponent } from './components/turnos/dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './components/turnos/dashboard/estadisticas-pacientes.component';
import { PacienteSearchTurnosComponent } from './components/turnos/punto-inicio/paciente-search-turnos.component';
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

import { BuscadorCie10Component } from './components/turnos/gestor-agendas/operaciones-agenda/buscador-cie10.component';


// ... RUP
import { RUPComponent } from './modules/rup/components/core/rup.component';
import { ElementosRUPService } from './modules/rup/services/elementosRUP.service';
import { BuscadorComponent } from './modules/rup/components/ejecucion/buscador.component';
import { HudsBusquedaComponent } from './modules/rup/components/ejecucion/hudsBusqueda.component';
import { PrestacionesService } from './modules/rup/services/prestaciones.service';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';
import { CamasService } from './modules/rup/services/camas.service';

import { ConceptObserverService } from './modules/rup/services/conceptObserver.service';
import { PrestacionCrearComponent } from './modules/rup/components/ejecucion/prestacionCrear.component';
import { SnomedBuscarComponent } from './components/snomed/snomed-buscar.component';
import { ResumenComponent } from './modules/rup/components/ejecucion/resumen.component';
import { PrestacionValidacionComponent } from './modules/rup/components//ejecucion/prestacionValidacion.component';
import { PrestacionEjecucionComponent } from './modules/rup/components//ejecucion/prestacionEjecucion.component';
import { PuntoInicioComponent } from './modules/rup/components/ejecucion/puntoInicio.component';
import { VistaHudsComponent } from './modules/rup/components/ejecucion/vistaHuds.component';
import { VistaCDAComponent } from './modules/rup/components/ejecucion/vistaCDA.component';
import { HudsBusquedaPacienteComponent } from './modules/rup/components/ejecucion/hudsBusquedaPaciente.component';

// Legacy para RUP
import { LaboratoriosComponent } from './modules/rup/components/laboratorios/laboratorios.component';
// Componentes de RUP
import { SelectPorRefsetComponent } from './modules/rup/components/elementos/selectPorRefset/SelectPorRefset.component';
import { TensionArterialComponent } from './modules/rup/components/elementos/tensionArterial.component';
import { SolicitudPrestacionDefaultComponent } from './modules/rup/components/elementos/solicitudPrestacionDefault/solicitudPrestacionDefault.component';
import { SaturacionOxigenoComponent } from './modules/rup/components/elementos/saturacionOxigeno.component';
import { FrecuenciaCardiacaComponent } from './modules/rup/components/elementos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './modules/rup/components/elementos/frecuenciaRespiratoria.component';
import { ObservacionesComponent } from './modules/rup/components/elementos/observaciones/observaciones.component';
import { EvolucionProblemaDefaultComponent } from './modules/rup/components/elementos/evolucionProblemaDefault/evolucionProblemaDefault.component';
import { AutocitadoComponent } from './modules/rup/components/elementos/autocitado/autocitado.component';
import { AdjuntarDocumentoComponent } from './modules/rup/components/elementos/adjuntarDocumento/adjuntarDocumento.component';
import { RegistrarMedicamentoDefaultComponent } from './modules/rup/components/elementos/registrarMedicamentoDefault/registrarMedicamentoDefault.component';
import { InformesComponent } from './modules/rup/components/elementos/informe/informe.component';
import { TabsComponent } from './modules/rup/components/ejecucion/huds-tabs/tabs/tabs.component';
import { TabComponent } from './modules/rup/components/ejecucion/huds-tabs/tabs/tab.component';
import { OdontogramaRefsetComponent } from './modules/rup/components/elementos/odontogramaRefSet/OdontogramaRefset.component';
import { LactanciaComponent } from './modules/rup/components/elementos/lactancia/lactancia.component';
import { IniciarInternacionComponent } from './modules/rup/components/ejecucion/internacion/iniciarInternacion.component';
import { OcuparCamaComponent } from './modules/rup/components/ejecucion/internacion/ocuparCama.component';
import { CensoDiarioComponent } from './modules/rup/components/internacion/censo/censoDiario.component';
import { CensoMensualComponent } from './modules/rup/components/internacion/censo/censoMensual.component';
import { ElementoDeRegistroComponent } from './modules/rup/components/elementos/elementoDeRegistro/elementoDeRegistro.component';
import { InformeEpicrisisComponent } from './modules/rup/components/elementos/informeDeEpicrisis/informeEpicrisis.component';
import { ListaEsperaInternacionComponent } from './modules/rup/components/ejecucion/internacion/ListaEsperaInternacion.component';
import { OdontologiaDefaultComponent } from './modules/rup/components/elementos/odontologiaDefault/odontologiaDefault.component';
import { InformeActividadNoNominalizadaComponent } from './modules/rup/components/elementos/informeActividadNoNominalizada/informeActividadNoNominalizada.component';
import { SeguimientoDelPesoComponent } from './modules/rup/components/elementos/seguimientoDelPeso.component';
import { TensionArterialPediatricaComponent } from './modules/rup/components/elementos/tensionArterialPediatrica.component';
import { ConsultaDeNinoSanoM2AComponent } from './modules/rup/components/elementos/consultaDeNinoSano/consultaDeNinoSanoM2A.component';
import { ConsultaDeNinoSanoE2Y3AComponent } from './modules/rup/components/elementos/consultaDeNinoSano/consultaDeNinoSanoE2Y3A.component';
import { ConsultaDeNinoSanoE3Y6AComponent } from './modules/rup/components/elementos/consultaDeNinoSano/consultaDeNinoSanoE3Y6A.component';
import { DesarrolloPsicomotorComponent } from './modules/rup/components/elementos/desarrolloPsicomotor/desarrolloPsicomotor.component';
import { RegistrarMedidasAntropometricasNinoE3Y6AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoE3Y6A.component';
import { RegistrarMedidasAntropometricasNinoM2AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoM2A.component';
import { RegistrarMedidasAntropometricasNinoE2Y3AComponent } from './modules/rup/components/elementos/RegistrarMedidasAntropometricasNinoE2Y3A.component';
import { SeleccionBinariaComponent } from './modules/rup/components/elementos/seleccionBinaria/seleccionBinaria.component';
import { ValorNumericoComponent } from './modules/rup/components/elementos/valorNumerico/valorNumerico.component';
import { MoleculaBaseComponent } from './modules/rup/components/elementos/moleculaBase/moleculaBase.component';

import { ProcedimientoDeEnfermeriaComponent } from './modules/rup/components/elementos/procedimientoDeEnfermeria/procedimientoDeEnfermeria.component';
// TODO: Eliminar todo esto de las llaves: deprecated
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
import { ConsultaDiagnosticoComponent } from './components/reportes/consultaDiagnostico.component';
import { CantidadConsultaXPrestacionComponent } from './components/reportes/cantidadConsultaXPrestacion.component';
import { EncabezadoReportesComponent } from './components/reportes/encabezadoReportes.component';


// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';


// Libs
// import { ChartModule } from 'angular2-chartjs';
import { ChartsModule } from 'ng2-charts';

// INTERNACION
import { EgresoInternacionComponent } from './modules/rup/components/ejecucion/internacion/egresoInternacion.component';
import { ResumenInternacionComponent } from './modules/rup/components/ejecucion/internacion/resumenInternacion.component';
import { PuntoInicioInternacionComponent } from './modules/rup/components/internacion/puntoInicio-internacion.component';

// Mapa de camas
import { MapaDeCamasComponent } from './modules/rup/components/internacion/mapa-de-camas/mapa-de-camas/mapa-de-camas.component';
import { CamaComponent } from './modules/rup/components/internacion/mapa-de-camas/cama/cama.component';
import { CamaEstadoComponent } from './modules/rup/components/internacion/mapa-de-camas/cama/camaEstado.component';
import { OrganizacionSectoresComponent } from './components/organizacion/organizacion-sectores.component';


// Solicitudes
import { SolicitudesComponent } from './components/top/solicitudes/solicitudes.component';
import { DetalleSolicitudComponent } from './components/top/solicitudes/detalleSolicitud.component';
import { AuditarSolicitudComponent } from './components/top/solicitudes/auditarSolicitud.component';
import { NuevaSolicitudComponent } from './components/top/solicitudes/nuevaSolicitud.component';

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


export let RUPRegistry = {
    'SelectPorRefsetComponent': SelectPorRefsetComponent,
    'EvolucionProblemaDefaultComponent': EvolucionProblemaDefaultComponent,
    'InformesComponent': InformesComponent,
    'ObservacionesComponent': ObservacionesComponent,
    'SaturacionOxigenoComponent': SaturacionOxigenoComponent,
    'SolicitudPrestacionDefaultComponent': SolicitudPrestacionDefaultComponent,
    'TensionArterialComponent': TensionArterialComponent,
    'FrecuenciaCardiacaComponent': FrecuenciaCardiacaComponent,
    'FrecuenciaRespiratoriaComponent': FrecuenciaRespiratoriaComponent,
    'AutocitadoComponent': AutocitadoComponent,
    'AdjuntarDocumentoComponent': AdjuntarDocumentoComponent,
    'RegistrarMedicamentoDefaultComponent': RegistrarMedicamentoDefaultComponent,
    'SeguimientoDelPesoComponent': SeguimientoDelPesoComponent,
    'InformeEpicrisisComponent': InformeEpicrisisComponent,
    'ElementoDeRegistroComponent': ElementoDeRegistroComponent,
    'OdontogramaRefsetComponent': OdontogramaRefsetComponent,
    'LactanciaComponent': LactanciaComponent,
    'OdontologiaDefaultComponent': OdontologiaDefaultComponent,
    'InformeActividadNoNominalizadaComponent': InformeActividadNoNominalizadaComponent,
    'TensionArterialPediatricaComponent': TensionArterialPediatricaComponent,
    'ConsultaDeNinoSanoM2AComponent': ConsultaDeNinoSanoM2AComponent,
    'ConsultaDeNinoSanoE2Y3AComponent': ConsultaDeNinoSanoE2Y3AComponent,
    'ConsultaDeNinoSanoE3Y6AComponent': ConsultaDeNinoSanoE3Y6AComponent,
    'DesarrolloPsicomotorComponent': DesarrolloPsicomotorComponent,
    'RegistrarMedidasAntropometricasNinoE3Y6AComponent': RegistrarMedidasAntropometricasNinoE3Y6AComponent,
    'RegistrarMedidasAntropometricasNinoM2AComponent': RegistrarMedidasAntropometricasNinoM2AComponent,
    'RegistrarMedidasAntropometricasNinoE2Y3AComponent': RegistrarMedidasAntropometricasNinoE2Y3AComponent,
    'SeleccionBinariaComponent': SeleccionBinariaComponent,
    'ValorNumericoComponent': ValorNumericoComponent,
    'ProcedimientoDeEnfermeriaComponent': ProcedimientoDeEnfermeriaComponent,
    'MoleculaBaseComponent': MoleculaBaseComponent
};

let RUPComponentsArray = [
    SelectPorRefsetComponent,
    AutocitadoComponent,
    EvolucionProblemaDefaultComponent,
    FrecuenciaCardiacaComponent,
    FrecuenciaRespiratoriaComponent,
    InformesComponent,
    ObservacionesComponent,
    RegistrarMedicamentoDefaultComponent,
    SaturacionOxigenoComponent,
    SeguimientoDelPesoComponent,
    SolicitudPrestacionDefaultComponent,
    TensionArterialComponent,
    AdjuntarDocumentoComponent,
    OdontogramaRefsetComponent,
    LactanciaComponent,
    IniciarInternacionComponent,
    CensoDiarioComponent,
    CensoMensualComponent,
    InformeEpicrisisComponent,
    ElementoDeRegistroComponent,
    OdontologiaDefaultComponent,
    InformeActividadNoNominalizadaComponent,
    TensionArterialPediatricaComponent,
    ConsultaDeNinoSanoM2AComponent,
    ConsultaDeNinoSanoE2Y3AComponent,
    ConsultaDeNinoSanoE3Y6AComponent,
    DesarrolloPsicomotorComponent,
    RegistrarMedidasAntropometricasNinoM2AComponent,
    RegistrarMedidasAntropometricasNinoE2Y3AComponent,
    RegistrarMedidasAntropometricasNinoE3Y6AComponent,
    SeleccionBinariaComponent,
    ValorNumericoComponent,
    ProcedimientoDeEnfermeriaComponent,
    MoleculaBaseComponent
];

/** moment pipes  - desde agular 5 hay que importar el locale a demanda */
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormTerapeuticoComponent } from './components/formularioTerapeutico/formTerapeutico.component';
import { FormTerapeuticoService } from './services/formTerapeutico/formTerapeutico.service';
import { ArbolItemComponent } from './components/formularioTerapeutico/arbolItem.component';
import { FormTerapeuticoDetallePageComponent } from './components/formularioTerapeutico/form-terapeutico-detalle.component';
import { AddformTerapeuticoComponent } from './components/formularioTerapeutico/add-form-terapeutico';
import { UploadFileComponent } from './shared/components/upload-file.component';



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
        NgDragDropModule.forRoot(),
        ChartsModule,
        routing,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAJuFVuMmVwV8gtP_1m3Ll1VzHagAI_X9I'
        })
    ],
    declarations: [
        AppComponent, InicioComponent, LoginComponent, SelectOrganizacionComponent,
        OrganizacionComponent, OrganizacionCreateUpdateComponent,
        CamaCreateUpdateComponent, CamasListadoComponent,
        ProfesionalComponent, ProfesionalCreateUpdateComponent,
        ProfesionalCreateUpdateComponent,
        UploadFileComponent,
        EspecialidadComponent, EspecialidadCreateUpdateComponent,
        PacienteCreateUpdateComponent, PacienteDetalleComponent, PacienteSearchComponent, DashboardComponent,
        MapsComponent, EdadPipe, ProfesionalPipe, FromNowPipe, FechaPipe, HoraPipe, PacientePipe, SexoPipe, OrganizacionPipe, SortBloquesPipe, TextFilterPipe,
        FilterPermisos, EnumerarPipe, PluralizarPipe, IconoCamaPipe,
        PlanificarAgendaComponent, AutocitarTurnoAgendasComponent, DinamicaFormComponent, BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        Html2TextPipe,
        PlanificarAgendaComponent, AutocitarTurnoAgendasComponent, BuscadorCie10Component, PanelEspacioComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, FiltrosMapaEspacioFisicoComponent,
        TipoPrestacionComponent, TipoPrestacionCreateUpdateComponent,
        DarTurnosComponent, CalendarioComponent, GestorAgendasComponent,
        TurnosComponent, BotonesAgendaComponent, ClonarAgendaComponent,
        ListaEsperaComponent, ListaEsperaCreateUpdateComponent, RevisionAgendaComponent, PopoverAuditComponent,
        RUPComponent, LiberarTurnoComponent, SuspenderTurnoComponent, AgregarNotaTurnoComponent, AgregarNotaAgendaComponent,
        AgregarSobreturnoComponent, PanelAgendaComponent,
        CarpetaPacienteComponent,
        ArancelamientoFormComponent,
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
        ConsultaDiagnosticoComponent,
        CantidadConsultaXPrestacionComponent,
        EncabezadoReportesComponent,
        ListarTurnosComponent, ListarCarpetasComponent,
        MapaEspacioFisicoComponent, SuspenderAgendaComponent,
        ResumenComponent,
        PrestacionCrearComponent,
        PrestacionEjecucionComponent,
        PrestacionValidacionComponent,
        SnomedBuscarComponent,
        HeaderPacienteComponent,
        PacienteDetalleActualizarComponent,
        HudsBusquedaComponent,
        BuscadorComponent,
        VistaHudsComponent,
        VistaCDAComponent,
        HudsBusquedaPacienteComponent,
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,

        // RUP
        ...RUPComponentsArray,
        TabsComponent,
        TabComponent,
        MapaDeCamasComponent,
        CamaComponent,
        PuntoInicioInternacionComponent,
        LaboratoriosComponent,
        OrganizacionSectoresComponent,
        EgresoInternacionComponent,
        ResumenInternacionComponent,
        ListaEsperaInternacionComponent,

        // Solicitudes
        SolicitudesComponent,
        DetalleSolicitudComponent,
        AuditarSolicitudComponent,
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

        SectoresItemComponent,
        PucoComponent,
        ReglasComponent,
        VisualizacionReglasComponent,
        // MPI
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,
        PacientePanelComponent,

        // form Terapeutico
        FormTerapeuticoComponent,
        ArbolItemComponent,
        FormTerapeuticoDetallePageComponent,
        AddformTerapeuticoComponent,
        // Configuracion prestacion
        ConfiguracionPrestacionVisualizarComponent,
        ConfiguracionPrestacionCrearComponent,
        PucoComponent
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
        SeleccionBinariaComponent
    ]
})

export class AppModule { }
