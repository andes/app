import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PlexModule } from '@andes/plex';
import { MapaCamasRouting } from './mapa-camas.routing';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { MapaCamasCapaComponent } from './mapa-camas-capa/mapa-camas-capa.component';
import { MapaCamasService } from './mapa-camas.service';
import { CensoDiarioComponent } from './censo-diario/censo-diario.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        MapaCamasRouting,
    ],
    declarations: [
        MapaCamasMainComponent,
        MapaCamasCapaComponent,
        CensoDiarioComponent
    ],
    providers: [MapaCamasService],
    exports: [],
})
export class MapaCamasModule {

}
