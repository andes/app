import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Module
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';


import { TurneroRouting } from './turnero.routing';
// import { PantallaService } from './services/pantalla.service';
// import { PantallasComponent } from './views/pantallas.component';
// import { PantallaDetalleComponent } from './views/pantalla-detalle.component';
// import { WebSocketService } from '../../services/websocket.serivice';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        AuthModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
        TurneroRouting
    ],
    declarations: [
        // PantallasComponent,
        // PantallaDetalleComponent
    ],
    entryComponents: [
        // PantallasComponent,
        // PantallaDetalleComponent
    ],
    exports: [],
    providers: [
        // PantallaService,
        // WebSocketService
    ]
})
export class TurneroModule {
}
