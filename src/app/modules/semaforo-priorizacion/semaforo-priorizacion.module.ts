import { PlexModule } from '@andes/plex';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SemaforoPriorizacionComponent } from './components/semaforo-priorizacion.component';
import { SemaforoService } from './service/semaforo.service';

@NgModule({
    imports: [
        PlexModule,
        CommonModule
    ],
    declarations: [
        SemaforoPriorizacionComponent
    ],
    providers: [
        SemaforoService
    ],
    exports: [SemaforoPriorizacionComponent],
})
export class SemaforoModule {

}
