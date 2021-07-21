import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
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
        RouterModule.forChild([
            { path: 'mapa_agendas', component: MapaAgendasComponent, pathMatch: 'full' },
        ])
    ],
    declarations: [
        MapaAgendasComponent,
        MapaAgendasMesComponent,
        MapaAgendasSemanaComponent,
    ]
})

export class MapaAgendaModule { }
