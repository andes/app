import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { ChartComponent } from './components/ejecucion/resumen-paciente/chart.component';
import { ResumenPacienteDinamicoNinoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico-nino.component';
import { ResumenPacienteDinamicoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico.component';
import { ResumenPacienteEstaticoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-estatico.component';
import { SeguimientoPacienteComponent } from './components/ejecucion/seguimiento-paciente/seguimientoPaciente.component';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { VistaAccesosHudsComponent } from './components/huds/vista-accesos-huds.component';
import { VistaCDAComponent } from './components/huds/vistaCDA.component';
import { VistaContextoPrestacionComponent } from './components/huds/vistaContextoPrestacion';
import { VistaDetalleRegistroComponent } from './components/huds/vistaDetalleRegistro';
import { VistaProcedimientoComponent } from './components/huds/vistaProcedimiento';
import { VistaRegistroComponent } from './components/huds/vistaRegistro';
import { VistaSolicitudTopComponent } from './components/huds/vistaSolicitudTop';
import { ElementosRUPModule } from './elementos-rup.module';
import { ChartsModule } from 'ng2-charts';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TOPLibModule } from 'src/app/components/top/top.module';
import { HudsBusquedaComponent } from './components/ejecucion/hudsBusqueda.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { RUPLibModule } from './rup-lib.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        MPILibModule,
        ElementosRUPModule,
        ChartsModule,
        InfiniteScrollModule,
        TOPLibModule,
        NgDragDropModule,
        RUPLibModule

    ],
    declarations: [
        VistaCDAComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
        SeguimientoPacienteComponent,
        ChartComponent,
        VistaRegistroComponent,
        VistaProcedimientoComponent,
        VistaContextoPrestacionComponent,
        VistaDetalleRegistroComponent,
        VistaAccesosHudsComponent,
        VistaSolicitudTopComponent,
        HudsBusquedaComponent
    ],
    exports: [
        VistaCDAComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
        SeguimientoPacienteComponent,
        ChartComponent,
        VistaRegistroComponent,
        VistaProcedimientoComponent,
        VistaContextoPrestacionComponent,
        VistaDetalleRegistroComponent,
        VistaAccesosHudsComponent,
        VistaSolicitudTopComponent,
        HudsBusquedaComponent
    ],
})
export class HUDSLibModule {

}
