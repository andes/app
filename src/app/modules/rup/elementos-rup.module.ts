import { FormBuilderModule } from '@andes/form-builder';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';
import { ChartsModule } from 'ng2-charts';
import { MitosModule } from '../../apps/mitos';
import { RelacionRUPPipe } from '../../pipes/relacionRUP.pipe';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { RUPComponent } from './components/core/rup.component';
import { RUPAccionesEnvioInformeComponent } from './components/ejecucion/acciones-envio-informe/acciones-envio-informe.component';
import { RUPMedicamentosBusquedaDetalleComponent } from './components/ejecucion/medicamentos-busqueda-detalle/medicamentos-busqueda-detalle.component';
import { ModalSeleccionEmailComponent } from './components/ejecucion/modal-seleccion-email.component';
import { AdjuntarDocumentoComponent } from './components/elementos/adjuntarDocumento.component';
import { AutocitadoComponent } from './components/elementos/autocitado.component';
import { CalculoDeBostonComponent } from './components/elementos/calculoDeBoston.component';
import { RUPObservacionesModalComponent } from './components/elementos/components/observaciones-modal.component';
import { ConsultaDeNinoSanoE2Y3AComponent } from './components/elementos/consultaDeNinoSanoE2Y3A.component';
import { ConsultaDeNinoSanoE3Y6AComponent } from './components/elementos/consultaDeNinoSanoE3Y6A.component';
import { ConsultaDeNinoSanoM2AComponent } from './components/elementos/consultaDeNinoSanoM2A.component';
import { ElementoDeRegistroComponent } from './components/elementos/deprecated/elementoDeRegistro.component';
import { InformesComponent } from './components/elementos/deprecated/informe.component';
import { InformeEpicrisisComponent } from './components/elementos/deprecated/informeEpicrisis.component';
import { DesarrolloPsicomotorComponent } from './components/elementos/desarrolloPsicomotor.component';
import { EvolucionProblemaDefaultComponent } from './components/elementos/evolucionProblemaDefault.component';
import { FormulaBaseComponent } from './components/elementos/FormulaBase.component';
import { FrecuenciaCardiacaComponent } from './components/elementos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './components/elementos/frecuenciaRespiratoria.component';
import { GraficoLinealComponent } from './components/elementos/graficoLineal.component';
import { IndiceDeMasaCorporalComponent } from './components/elementos/indiceDeMasaCorporal.component';
import { InformeActividadNoNominalizadaComponent } from './components/elementos/informeActividadNoNominalizada.component';
import { InternacionEgresoComponent } from './components/elementos/internacionEgreso.component';
import { InternacionIngresoComponent } from './components/elementos/internacionIngreso.component';
import { LactanciaComponent } from './components/elementos/lactancia.component';
import { MoleculaBaseComponent } from './components/elementos/moleculaBase.component';
import { NuevaEvolucionProblemaComponent } from './components/elementos/nuevaEvolucionProblema.component';
import { OdontogramaRefsetComponent } from './components/elementos/OdontogramaRefset.component';
import { PesoComponent } from './components/elementos/peso.component';
import { ProcedimientoDeEnfermeriaComponent } from './components/elementos/procedimientoDeEnfermeria.component';
import { RecetaMedicaComponent } from './components/elementos/recetaMedica.component';
import { RegistrarMedicamentoDefaultComponent } from './components/elementos/registrarMedicamentoDefault.component';
import { ResumenHistoriaClinicaComponent } from './components/elementos/resumenHistoriaClinica.component';
import { ChecklistComponent } from './components/elementos/rupers/check-list/checklist.component';
import { SolicitudPrescripcionMedicamentoComponent } from './components/elementos/rupers/prescripcion-medicamento/prescripcion-medicamento.component';
import { SeccionComponent } from './components/elementos/rupers/seccionado/seccion.component';
import { SeccionadoComponent } from './components/elementos/rupers/seccionado/seccionado.component';
import { SelectBaseComponent } from './components/elementos/rupers/select-base.component';
import { SelectOrganizacionComponent } from './components/elementos/rupers/select-organizacion.component';
import { SelectPrestacionComponent } from './components/elementos/rupers/select-prestacion.component';
import { SelectProfesionalComponent } from './components/elementos/rupers/select-profesional.component';
import { SelectSnomedComponent } from './components/elementos/rupers/select-snomed.component';
import { SelectStaticoComponent } from './components/elementos/rupers/select-statico.component';
import { ObservacionesComponent } from './components/elementos/rupers/texto-enriquecido/observaciones.component';
import { SaturacionOxigenoComponent } from './components/elementos/saturacionOxigeno.component';
import { SeleccionBinariaComponent } from './components/elementos/seleccionBinaria.component';
import { SelectPorRefsetComponent } from './components/elementos/SelectPorRefset.component';
import { SolicitudPrestacionDefaultComponent } from './components/elementos/solicitudPrestacionDefault.component';
import { TallaComponent } from './components/elementos/talla.component';
import { TemperaturaComponent } from './components/elementos/temperatura.component';
import { TensionDiastolicaComponent } from './components/elementos/tensionDiastolica.component';
import { TensionSistolicaComponent } from './components/elementos/tensionSistolica.component';
import { UltimaFechaComponent } from './components/elementos/ultimaFecha.component';
import { VacunasComponent } from './components/elementos/vacunas.component';
import { ValorFechaComponent } from './components/elementos/valorFecha.component';
import { ValorNumericoComponent } from './components/elementos/valorNumerico.component';
import { VistaPrestacionComponent } from './components/huds/vistaPrestacion';
import { ElementoRUPByIdPipes } from './pipes/elemento-rup-id.pipes';
import { SemanticClassPipe } from './pipes/semantic-class.pipes';
import { SemanticIconPipe } from './pipes/semantic-icon.pipes';







const RUPComponentsArray = [
    RUPComponent,
    SelectPorRefsetComponent,
    AutocitadoComponent,
    EvolucionProblemaDefaultComponent,
    FrecuenciaCardiacaComponent,
    FrecuenciaRespiratoriaComponent,
    IndiceDeMasaCorporalComponent,
    InformesComponent,
    NuevaEvolucionProblemaComponent,
    ObservacionesComponent,
    PesoComponent,
    RecetaMedicaComponent,
    RegistrarMedicamentoDefaultComponent,
    SaturacionOxigenoComponent,
    GraficoLinealComponent,
    SolicitudPrestacionDefaultComponent,
    TallaComponent,
    TemperaturaComponent,
    TensionDiastolicaComponent,
    TensionSistolicaComponent,
    AdjuntarDocumentoComponent,
    OdontogramaRefsetComponent,
    LactanciaComponent,
    InformeEpicrisisComponent,
    ElementoDeRegistroComponent,
    InformeActividadNoNominalizadaComponent,
    ConsultaDeNinoSanoM2AComponent,
    ConsultaDeNinoSanoE2Y3AComponent,
    ConsultaDeNinoSanoE3Y6AComponent,
    DesarrolloPsicomotorComponent,
    ResumenHistoriaClinicaComponent,
    FormulaBaseComponent,
    CalculoDeBostonComponent,
    SeleccionBinariaComponent,
    ValorNumericoComponent,
    ValorFechaComponent,
    UltimaFechaComponent,
    MoleculaBaseComponent,
    ProcedimientoDeEnfermeriaComponent,
    SelectOrganizacionComponent,
    SelectProfesionalComponent,
    SelectPrestacionComponent,
    SelectSnomedComponent,
    SelectStaticoComponent,
    SelectBaseComponent,
    SeccionadoComponent,
    SeccionComponent,
    InternacionEgresoComponent,
    InternacionIngresoComponent,
    ChecklistComponent,
    VacunasComponent,
    SolicitudPrescripcionMedicamentoComponent
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        ChartsModule,
        NgDragDropModule,
        MPILibModule,
        MitosModule,
        FormBuilderModule
    ],
    declarations: [
        ...RUPComponentsArray,
        RUPAccionesEnvioInformeComponent,
        ModalSeleccionEmailComponent,
        VistaPrestacionComponent,
        RelacionRUPPipe,
        RUPObservacionesModalComponent,
        SemanticIconPipe,
        SemanticClassPipe,
        ElementoRUPByIdPipes,
        RUPMedicamentosBusquedaDetalleComponent
    ],
    entryComponents: [
        ...RUPComponentsArray
    ],
    exports: [
        ...RUPComponentsArray,
        RUPAccionesEnvioInformeComponent,
        ModalSeleccionEmailComponent,
        VistaPrestacionComponent,
        RelacionRUPPipe,
        SemanticIconPipe,
        SemanticClassPipe,
        ElementoRUPByIdPipes
    ],
})
export class ElementosRUPModule {

}
