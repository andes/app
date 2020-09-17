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
import { SolicitudesComponent } from './solicitudes/solicitudes.component';
import { DetalleSolicitudComponent } from './solicitudes/detalleSolicitud.component';
import { PrestacionSolicitudComponent } from './solicitudes/prestacionSolicitud.component';
import { AuditarSolicitudComponent } from './solicitudes/auditarSolicitud.component';
import { AnularSolicitudComponent } from './solicitudes/anularSolicitud.component';
import { ReglasComponent } from './reglas/reglas.component';
import { ListaReglasComponent } from './reglas/listaReglas.component';
import { VisualizacionReglasTopComponent } from './reglas/visualizacionReglasTop.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CITASLibModule } from '../turnos/citas.module';

import { RUPLibModule } from 'src/app/modules/rup/rup-lib.module';


export const TOP_COMPONENTS = [
    BusquedaPacienteComponent,
    VisualizacionReglasComponent,
    HistorialSolicitudComponent,
    NuevaSolicitudComponent,
    SolicitudesComponent,
    DetalleSolicitudComponent,
    PrestacionSolicitudComponent,
    AuditarSolicitudComponent,
    AnularSolicitudComponent,
    ReglasComponent,
    ListaReglasComponent,
    VisualizacionReglasTopComponent,

];

export const TOP_PROVIDERS = [
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
        InfiniteScrollModule,
        MPILibModule,
        CITASLibModule,
        TOPRouting,
        RUPLibModule,
    ],
    declarations: [
        ...TOP_COMPONENTS
    ],
    providers: [
        ...TOP_PROVIDERS
    ],
    exports: [
        VisualizacionReglasTopComponent,
        VisualizacionReglasComponent,
        HistorialSolicitudComponent
    ],
})
export class TOPLibModule {

}
