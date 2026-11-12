import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { DirectiveLibModule } from '../../directives/directives.module';
import { MapaAgendaColoresListadoComponent } from './mapa-agenda-colores-listado.component';
import { MapaAgendaColoresCreateUpdateComponent } from './mapa-agenda-colores-create-update.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PlexModule,
        SharedModule,
        HttpClientModule,
        DirectiveLibModule,
        RouterModule.forChild([
            { path: '', component: MapaAgendaColoresListadoComponent, pathMatch: 'full' },
            { path: 'create', component: MapaAgendaColoresCreateUpdateComponent },
            { path: 'create/:id', component: MapaAgendaColoresCreateUpdateComponent },
        ])
    ],
    declarations: [
        MapaAgendaColoresListadoComponent,
        MapaAgendaColoresCreateUpdateComponent,
    ],
})
export class MapaAgendaColoresTmModule {

}
