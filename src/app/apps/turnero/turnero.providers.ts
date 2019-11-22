import { NgModule } from '@angular/core';
import { PantallaService } from './services/pantalla.service';
import { TurneroService } from './services/turnero.service';

@NgModule({
    providers: [
        PantallaService,
        TurneroService
    ]
})
export class TurneroProvidersModule {
}
