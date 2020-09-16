import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { VisualizacionReglasComponent } from './reglas/visualizacionReglas.component';
import { HistorialSolicitudComponent } from './solicitudes/historialSolicitud.component';
import { DirectiveLibModule } from '../../directives/directives.module';
import { BusquedaPacienteComponent } from './solicitudes/busquedaPaciente.component';
import { MPILibModule } from '../../modules/mpi/mpi-lib.module';
import { TOPRouting } from './top.routing';
import { NuevaSolicitudComponent } from './solicitudes/nuevaSolicitud.component';

export const TOP_COMPONENTS = [
    BusquedaPacienteComponent,
    VisualizacionReglasComponent,
    HistorialSolicitudComponent,
    NuevaSolicitudComponent
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        MPILibModule,
        TOPRouting
    ],
    declarations: [
        ...TOP_COMPONENTS
    ],
    exports: [
        BusquedaPacienteComponent,
        VisualizacionReglasComponent,
        HistorialSolicitudComponent
    ],
})
export class TOPLibModule {

}
