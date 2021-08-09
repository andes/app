import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';
import { ChartsModule } from 'ng2-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TOPLibModule } from 'src/app/components/top/top.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { HudsBusquedaComponent } from './components/ejecucion/hudsBusqueda.component';
import { ChartComponent } from './components/ejecucion/resumen-paciente/chart.component';
import { ResumenPacienteDinamicoNinoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico-nino.component';
import { ResumenPacienteDinamicoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico.component';
import { ResumenPacienteEstaticoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-estatico.component';
import { VistaAccesosHudsComponent } from './components/huds/vista-accesos-huds.component';
import { VistaIPSComponent } from './components/huds/vista-ips.component';
import { VistaCDAComponent } from './components/huds/vistaCDA.component';
import { VistaContextoPrestacionComponent } from './components/huds/vistaContextoPrestacion';
import { VistaDetalleRegistroComponent } from './components/huds/vistaDetalleRegistro';
import { VistaProcedimientoComponent } from './components/huds/vistaProcedimiento';
import { VistaRegistroComponent } from './components/huds/vistaRegistro';
import { VistaSolicitudTopComponent } from './components/huds/vistaSolicitudTop';
import { ElementosRUPModule } from './elementos-rup.module';
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
        RUPLibModule,
        SharedModule

    ],
    declarations: [
        VistaCDAComponent,
        VistaIPSComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
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
        VistaIPSComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
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
