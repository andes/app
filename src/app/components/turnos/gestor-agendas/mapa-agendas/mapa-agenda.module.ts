import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CITASLibModule } from 'src/app/components/turnos/citas.module';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { DarTurnoSlotComponent } from './dar-turno-slot/dar-turno-slot.component';
import { MapaAgendasMesComponent } from './mapa-agenda-mes.component';
import { MapaAgendasSemanaComponent } from './mapa-agenda-semana.component';
import { MapaAgendasComponent } from './mapa-agendas.component';

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
        CITASLibModule,
        RouterModule.forChild([
            { path: 'mapa_agendas', component: MapaAgendasComponent, pathMatch: 'full' },
        ])
    ],
    declarations: [
        MapaAgendasComponent,
        MapaAgendasMesComponent,
        MapaAgendasSemanaComponent,
        DarTurnoSlotComponent,
    ]
})

export class MapaAgendaModule { }
