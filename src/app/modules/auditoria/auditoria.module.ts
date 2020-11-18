import { SharedModule } from '@andes/shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MPILibModule } from '../mpi/mpi-lib.module';
import { ListadoAuditoriaComponent } from './component/auditoria-listado.component';
import { VincularPacientesComponent } from './component/vincular-pacientes.component';
import { ModalCorreccionPacienteComponent } from './component/modal-correccion-paciente.component';
import { ReporteErroresComponent } from './component/reporte-errores.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        MPILibModule
    ],
    declarations: [
        ListadoAuditoriaComponent,
        VincularPacientesComponent,
        ModalCorreccionPacienteComponent,
        ReporteErroresComponent
    ],
    exports: [
        ListadoAuditoriaComponent,
        VincularPacientesComponent,
        ModalCorreccionPacienteComponent,
        ReporteErroresComponent
    ]
})

export class AuditoriaModule { }
