import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { RUPLibModule } from 'src/app/modules/rup/rup-lib.module';
import { CITASLibModule } from '../turnos/citas.module';
import { TOPLibModule } from './top.module';

import { NuevaSolicitudComponent } from './solicitudes/nuevaSolicitud.component';
import { SolicitudesComponent } from './solicitudes/solicitudes.component';
import { ListaReglasComponent } from './reglas/listaReglas.component';
import { ReglasComponent } from './reglas/reglas.component';
import { AnularSolicitudComponent } from './solicitudes/anularSolicitud.component';
import { AuditarSolicitudComponent } from './solicitudes/auditarSolicitud.component';
import { BusquedaPacienteComponent } from './solicitudes/busquedaPaciente.component';
import { DetalleSolicitudComponent } from './solicitudes/detalleSolicitud.component';
import { PrestacionSolicitudComponent } from './solicitudes/prestacionSolicitud.component';
import { VisualizacionReglasTopComponent } from './reglas/visualizacionReglasTop.component';
import { EstadoSolicitudPipe } from './pipes/estado-solicitud.pipe';
import { EstadoPrestacionPipe } from './pipes/estado-prestacion.pipe';
import { AuditoriasSolicitudPipe } from './pipes/auditorias-solicitud.pipe';
import { BotonesSolicitudPipe } from './pipes/botones.pipe';
import { LinkTurnoRemotoPipe } from './pipes/linkTurnoRemoto.pipe';
import { IsEmptyPipe } from './pipes/isEmpty.pipe';
import { IsNotEmptyPipe } from './pipes/isNotEmpty.pipe';

export const TOP_ROUTES = [
    { path: '', component: SolicitudesComponent, pathMatch: 'full' },
    { path: ':tipo/:paciente', component: NuevaSolicitudComponent },
    { path: 'asignadas', component: SolicitudesComponent },
    { path: 'reglas', component: ReglasComponent },
    { path: 'reglasVisualizacion', component: VisualizacionReglasTopComponent, },
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
        RUPLibModule,
        TOPLibModule,
        RouterModule.forChild(TOP_ROUTES)
    ],
    providers: [],
    declarations: [
        NuevaSolicitudComponent,
        SolicitudesComponent,
        DetalleSolicitudComponent,
        PrestacionSolicitudComponent,
        AuditarSolicitudComponent,
        AnularSolicitudComponent,
        ReglasComponent,
        ListaReglasComponent,
        BusquedaPacienteComponent,
        EstadoSolicitudPipe,
        EstadoPrestacionPipe,
        AuditoriasSolicitudPipe,
        BotonesSolicitudPipe,
        LinkTurnoRemotoPipe,
        IsEmptyPipe,
        IsNotEmptyPipe
    ]
})
export class TOPRouting { }
