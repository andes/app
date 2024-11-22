import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Module
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


import { TurneroRouting } from './turnero.routing';
import { PantallasComponent } from './views/pantallas.component';
import { PantallaDetalleComponent } from './views/pantalla-detalle.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        AuthModule,
        FormsModule,
        HttpClientModule,
        TurneroRouting
    ],
    declarations: [
        PantallasComponent,
        PantallaDetalleComponent
    ],
    exports: [],
    providers: [
        HttpClient,
    ]
})
export class TurneroModule {
}
