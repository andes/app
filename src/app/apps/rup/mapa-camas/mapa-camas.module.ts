import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PlexModule } from '@andes/plex';
import { MapaCamasRouting } from './mapa-camas.routing';


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

    ],
    providers: [],
    exports: [],
})
export class MapaCamasModule {

}
