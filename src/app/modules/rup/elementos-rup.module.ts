import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { ChartsModule } from 'ng2-charts';
import { NgDragDropModule } from 'ng-drag-drop';


import { SelectPorRefsetComponent } from './components/elementos/SelectPorRefset.component';
import { AutocitadoComponent } from './components/elementos/autocitado.component';
import { EvolucionProblemaDefaultComponent } from './components/elementos/evolucionProblemaDefault.component';
import { FiltradoGlomerularComponent } from './components/elementos/filtradoGlomerular.component';
import { FrecuenciaCardiacaComponent } from './components/elementos/frecuenciaCardiaca.component';
import { FrecuenciaRespiratoriaComponent } from './components/elementos/frecuenciaRespiratoria.component';
import { HipertensionArterialComponent } from './components/elementos/hipertensionArterial.component';
import { IndiceDeMasaCorporalComponent } from './components/elementos/indiceDeMasaCorporal.component';
import { InformesComponent } from './components/elementos/informe.component';
import { NuevaEvolucionProblemaComponent } from './components/elementos/nuevaEvolucionProblema.component';
import { ObesidadComponent } from './components/elementos/obesidad.component';
import { ObservacionesComponent } from './components/elementos/observaciones.component';
import { PesoComponent } from './components/elementos/peso.component';
import { PercentiloPerimetroCefalicoComponent } from './components/elementos/percentiloPerimetroCefalico.component';
import { PerimetroCefalicoComponent } from './components/elementos/perimetroCefalico.component';
import { RegistrarMedicamentoDefaultComponent } from './components/elementos/registrarMedicamentoDefault.component';
import { SaturacionOxigenoComponent } from './components/elementos/saturacionOxigeno.component';
import { GraficoLinealComponent } from './components/elementos/graficoLineal.component';
import { SignosVitalesComponent } from './components/elementos/signosVitales.component';
import { SolicitudPrestacionDefaultComponent } from './components/elementos/solicitudPrestacionDefault.component';
import { TallaComponent } from './components/elementos/talla.component';
import { TemperaturaComponent } from './components/elementos/temperatura.component';
import { TensionArterialComponent } from './components/elementos/tensionArterial.component';
import { TensionDiastolicaComponent } from './components/elementos/tensionDiastolica.component';
import { TensionSistolicaComponent } from './components/elementos/tensionSistolica.component';
import { AdjuntarDocumentoComponent } from './components/elementos/adjuntarDocumento.component';
import { OtoemisionAcusticaDeOidoDerechoComponent } from './components/elementos/otoemisionAcusticaDeOidoDerecho.component';
import { OtoemisionAcusticaDeOidoIzquierdoComponent } from './components/elementos/otoemisionAcusticaDeOidoIzquierdo.component';
import { OdontogramaRefsetComponent } from './components/elementos/OdontogramaRefset.component';
import { LactanciaComponent } from './components/elementos/lactancia.component';
import { InformeEpicrisisComponent } from './components/elementos/deprecated/informeEpicrisis.component';
import { ElementoDeRegistroComponent } from './components/elementos/deprecated/elementoDeRegistro.component';
import { OdontologiaDefaultComponent } from './components/elementos/odontologiaDefault.component';
import { CircunferenciaCinturaComponent } from './components/elementos/circunferenciaCintura.component';
import { InternacionEgresoComponent } from './components/elementos/internacionEgreso.component';
import { InternacionIngresoComponent } from './components/elementos/internacionIngreso.component';

import { InformeActividadNoNominalizadaComponent } from './components/elementos/informeActividadNoNominalizada.component';
import { PercentiloPesoComponent } from './components/elementos/percentiloPeso.component';
import { PercentiloTallaComponent } from './components/elementos/percentiloTalla.component';
import { PercentiloDeMasaCorporalComponent } from './components/elementos/percentiloDeMasaCorporal.component';
import { TensionArterialPediatricaComponent } from './components/elementos/tensionArterialPediatrica.component';
import { PercentiloDeTensionArterialComponent } from './components/elementos/percentiloDeTensionArterial.component';
import { ConsultaDeNinoSanoM2AComponent } from './components/elementos/consultaDeNinoSanoM2A.component';
import { ConsultaDeNinoSanoE2Y3AComponent } from './components/elementos/consultaDeNinoSanoE2Y3A.component';
import { ConsultaDeNinoSanoE3Y6AComponent } from './components/elementos/consultaDeNinoSanoE3Y6A.component';
import { DesarrolloPsicomotorComponent } from './components/elementos/desarrolloPsicomotor.component';
import { RegistrarMedidasAntropometricasNinoM2AComponent } from './components/elementos/RegistrarMedidasAntropometricasNinoM2A.component';
import { RegistrarMedidasAntropometricasNinoE2Y3AComponent } from './components/elementos/RegistrarMedidasAntropometricasNinoE2Y3A.component';
import { RegistrarMedidasAntropometricasNinoE3Y6AComponent } from './components/elementos/RegistrarMedidasAntropometricasNinoE3Y6A.component';
import { ResumenHistoriaClinicaComponent } from './components/elementos/resumenHistoriaClinica.component';
import { FormulaBaseComponent } from './components/elementos/FormulaBase.component';
import { CalculoDeBostonComponent } from './components/elementos/calculoDeBoston.component';
import { SeleccionBinariaComponent } from './components/elementos/seleccionBinaria.component';
import { ValorNumericoComponent } from './components/elementos/valorNumerico.component';
import { ValorFechaComponent } from './components/elementos/valorFecha.component';

import { UltimaFechaComponent } from './components/elementos/ultimaFecha.component';

import { MoleculaBaseComponent } from './components/elementos/moleculaBase.component';
import { ProcedimientoDeEnfermeriaComponent } from './components/elementos/procedimientoDeEnfermeria.component';

import { LugarDeNacimientoComponent } from './components/elementos/lugarDeNacimiento.component';
import { SelectOrganizacionComponent } from './components/elementos/rupers/select-organizacion.component';
import { SelectProfesionalComponent } from './components/elementos/rupers/select-profesional.component';
import { SelectPrestacionComponent } from './components/elementos/rupers/select-prestacion.component';
import { SelectSnomedComponent } from './components/elementos/rupers/select-snomed.component';
import { SelectStaticoComponent } from './components/elementos/rupers/select-statico.component';
import { SelectBaseComponent } from './components/elementos/rupers/select-base.component';
import { SeccionadoComponent } from './components/elementos/rupers/seccionado/seccionado.component';
import { SeccionComponent } from './components/elementos/rupers/seccionado/seccion.component';

import { RUPComponent } from './components/core/rup.component';
import { RUPAccionesEnvioInformeComponent } from './components/ejecucion/acciones-envio-informe/acciones-envio-informe.component';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ModalSeleccionEmailComponent } from './components/ejecucion/modal-seleccion-email.component';
import { VistaPrestacionComponent } from './components/huds/vistaPrestacion';
import { RelacionRUPPipe } from '../../pipes/relacionRUP.pipe';

const RUPComponentsArray = [
    RUPComponent,
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
    OtoemisionAcusticaDeOidoDerechoComponent,
    OtoemisionAcusticaDeOidoIzquierdoComponent,
    OdontogramaRefsetComponent,
    LactanciaComponent,
    InformeEpicrisisComponent,
    ElementoDeRegistroComponent,
    OdontologiaDefaultComponent,
    CircunferenciaCinturaComponent,
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
    ValorFechaComponent,
    UltimaFechaComponent,
    MoleculaBaseComponent,
    ProcedimientoDeEnfermeriaComponent,
    LugarDeNacimientoComponent,
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
        MPILibModule
    ],
    declarations: [
        ...RUPComponentsArray,
        RUPAccionesEnvioInformeComponent,
        ModalSeleccionEmailComponent,
        VistaPrestacionComponent,
        RelacionRUPPipe
    ],
    entryComponents: [
        ...RUPComponentsArray
    ],
    providers: [
    ],
    exports: [
        ...RUPComponentsArray,
        RUPAccionesEnvioInformeComponent,
        ModalSeleccionEmailComponent,
        // Por el momento en este modulo. Hay que armar un modulo HUDS.
        VistaPrestacionComponent,
        RelacionRUPPipe
    ],
})
export class ElementosRUPModule {

}
