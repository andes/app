import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RUPRouting } from './rup.routing';
import { SharedModule } from '@andes/shared';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ElementosRUPModule } from './elementos-rup.module';
import { NgDragDropModule } from 'ng-drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChartsModule } from 'ng2-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RUPLibModule } from './rup-lib.module';


import { PuntoInicioComponent } from './components/ejecucion/puntoInicio.component';
import { PrestacionCrearComponent } from './components/ejecucion/prestacionCrear.component';
import { PrestacionEjecucionComponent } from './components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/ejecucion/prestacionValidacion.component';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { HudsBusquedaPacienteComponent } from './components/ejecucion/hudsBusquedaPaciente.component';
import { PlantillasRUPComponent } from '../../apps/rup/plantillas-rup/plantillas-rup.component';
import { BuscadorComponent } from './components/ejecucion/buscador.component';
import { HudsBusquedaComponent } from './components/ejecucion/hudsBusqueda.component';
import { RupRelacionesComponent } from './components/huds/relaciones-rup.component';
import { VistaCDAComponent } from './components/huds/vistaCDA.component';
import { ResumenPacienteEstaticoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-estatico.component';
import { ResumenPacienteDinamicoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico.component';
import { ResumenPacienteDinamicoNinoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico-nino.component';
import { SeguimientoPacienteComponent } from './components/ejecucion/seguimiento-paciente/seguimientoPaciente.component';
import { HelpSolicitudComponent } from './components/ejecucion/help-solicitud.component';
import { ChartComponent } from './components/ejecucion/resumen-paciente/chart.component';
import { VistaRegistroComponent } from './components/huds/vistaRegistro';
import { VistaProcedimientoComponent } from './components/huds/vistaProcedimiento';
import { VistaContextoPrestacionComponent } from './components/huds/vistaContextoPrestacion';
import { VistaDetalleRegistroComponent } from './components/huds/vistaDetalleRegistro';
import { VistaAccesosHudsComponent } from './components/huds/vista-accesos-huds.component';
import { VistaSolicitudTopComponent } from './components/huds/vistaSolicitudTop';
import { SnomedBuscarComponent } from '../../components/snomed/snomed-buscar.component';
import { TOPLibModule } from '../../components/top/top.module';
import { DirectiveLibModule } from '../../directives/directives.module';
import { CITASLibModule } from '../../components/turnos/citas.module';
import { DinamicaFormComponent } from '../../components/turnos/autocitar/dinamica.component';
import { AutocitarTurnoAgendasComponent } from '../../components/turnos/autocitar/autocitar.component';
import { SnomedLinkComponent } from './directives/snomed-link';



export const RUP_COMPONENTS = [
    PuntoInicioComponent,
    PrestacionCrearComponent,
    PrestacionEjecucionComponent,
    PrestacionValidacionComponent,
    VistaHudsComponent,
    HudsBusquedaPacienteComponent,
    PlantillasRUPComponent,
    BuscadorComponent,
    HudsBusquedaComponent,
    RupRelacionesComponent,
    VistaCDAComponent,
    ResumenPacienteEstaticoComponent,
    ResumenPacienteDinamicoComponent,
    ResumenPacienteDinamicoNinoComponent,
    SeguimientoPacienteComponent,
    HelpSolicitudComponent,
    ChartComponent,
    VistaRegistroComponent,
    VistaProcedimientoComponent,
    VistaContextoPrestacionComponent,
    VistaDetalleRegistroComponent,
    VistaAccesosHudsComponent,
    VistaSolicitudTopComponent,
    SnomedBuscarComponent,
    DinamicaFormComponent,
    AutocitarTurnoAgendasComponent,
    SnomedLinkComponent
];

export const RUP_PROVIDERS = [
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        RUPRouting,
        SharedModule,
        MPILibModule,
        ElementosRUPModule,
        RUPLibModule,
        TOPLibModule,
        DirectiveLibModule,
        CITASLibModule,
        NgDragDropModule.forRoot(),
        ScrollingModule,
        ChartsModule,
        InfiniteScrollModule
    ],
    declarations: [
        ...RUP_COMPONENTS
    ],
    providers: [
        ...RUP_PROVIDERS
    ],
    exports: [],
})
export class RUPModule {

}
