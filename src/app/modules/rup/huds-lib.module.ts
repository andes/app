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
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { HudsBusquedaComponent } from './components/ejecucion/hudsBusqueda.component';
import { ChartComponent } from './components/ejecucion/resumen-paciente/chart.component';
import { ResumenPacienteDinamicoNinoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico-nino.component';
import { ResumenPacienteDinamicoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-dinamico.component';
import { ResumenPacienteEstaticoComponent } from './components/ejecucion/resumen-paciente/resumenPaciente-estatico.component';
import { DetallePrestacionComponent } from './components/huds/detallePrestacion';
import { DetalleProcedimientoComponent } from './components/huds/detalleProcedimiento';
import { DetalleRegistronComponent } from './components/huds/detalleRegistro';
import { DetalleRegistroInternoComponent } from './components/huds/detalleRegistroInterno';
import { DetalleRegistroInternacionComponent } from './components/huds/internacion/detalleRegistroInternación.component';
import { DetallePacienteComponent } from './components/huds/internacion/paciente/detallePaciente';
import { ListadoRegistrosComponent } from './components/huds/internacion/registro/listadoRegistros';
import { ListadoInternacionHudsComponent } from './components/huds/listado-internacion-huds.component';
import { VistaAccesosHudsComponent } from './components/huds/vista-accesos-huds.component';
import { VistaIPSComponent } from './components/huds/vista-ips.component';
import { VistaCDAComponent } from './components/huds/vistaCDA.component';
import { VistaContextoPrestacionComponent } from './components/huds/vistaContextoPrestacion';
import { VistaDetalleRegistroComponent } from './components/huds/vistaDetalleRegistro';
import { VistaHistorialTurnosComponent } from './components/huds/vistaHistorialTurnos.component';
import { VistaSolicitudTopComponent } from './components/huds/vistaSolicitudTop';
import { ElementosRUPModule } from './elementos-rup.module';
import { RUPLibModule } from './rup-lib.module';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
import { VistaLaboratorioComponent } from './components/ejecucion/laboratorios/vista-laboratorio.component';
import { VistaRecetaComponent } from './components/huds/vistaReceta';
import { SuspenderMedicacionComponent } from './components/ejecucion/recetas/suspenderMedicacion';
import { RenovarMedicacionComponent } from './components/ejecucion/recetas/renovarMedicacion';

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
        SharedModule,
        DirectiveLibModule

    ],
    declarations: [
        VistaCDAComponent,
        VistaLaboratorioComponent,
        VistaIPSComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
        ChartComponent,
        VistaContextoPrestacionComponent,
        DetallePrestacionComponent,
        DetalleRegistroInternacionComponent,
        DetalleRegistroInternoComponent,
        DetalleProcedimientoComponent,
        VistaRecetaComponent,
        ListadoRegistrosComponent,
        DetalleRegistronComponent,
        DetallePacienteComponent,
        VistaDetalleRegistroComponent,
        VistaAccesosHudsComponent,
        VistaSolicitudTopComponent,
        VistaHistorialTurnosComponent,
        HudsBusquedaComponent,
        ListadoInternacionHudsComponent,
        SuspenderMedicacionComponent,
        RenovarMedicacionComponent
    ],
    exports: [
        VistaCDAComponent,
        VistaLaboratorioComponent,
        VistaIPSComponent,
        ResumenPacienteEstaticoComponent,
        ResumenPacienteDinamicoComponent,
        ResumenPacienteDinamicoNinoComponent,
        ChartComponent,
        VistaContextoPrestacionComponent,
        DetallePrestacionComponent,
        DetalleRegistroInternacionComponent,
        DetalleRegistronComponent,
        DetalleRegistroInternoComponent,
        DetalleProcedimientoComponent,
        VistaRecetaComponent,
        VistaDetalleRegistroComponent,
        VistaAccesosHudsComponent,
        VistaSolicitudTopComponent,
        VistaHistorialTurnosComponent,
        HudsBusquedaComponent,
        ListadoInternacionHudsComponent,
        SuspenderMedicacionComponent
    ],

    providers: [MotivosHudsService]
})
export class HUDSLibModule {

}
