import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SnomedBuscarComponent } from 'src/app/components/snomed/snomed-buscar.component';
import { BuscadorComponent } from './components/ejecucion/buscador.component';
import { ModalMotivoAccesoHudsComponent } from './components/huds/modal-motivo-acceso-huds.component';
import { RUPCardComponent } from './components/huds/rup-card/rup-card.component';
import { SnomedLinkComponent } from './directives/snomed-link';
import { SnomedSinonimoComponent } from './directives/snomed-sinonimo';
import { ElementosRUPModule } from './elementos-rup.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        ScrollingModule,
        ElementosRUPModule
    ],
    declarations: [
        ModalMotivoAccesoHudsComponent,
        RUPCardComponent,
        BuscadorComponent,
        SnomedBuscarComponent,
        SnomedLinkComponent,
        SnomedSinonimoComponent
    ],
    exports: [
        ModalMotivoAccesoHudsComponent,
        RUPCardComponent,
        BuscadorComponent,
        SnomedBuscarComponent,
        ScrollingModule,
        SnomedLinkComponent,
        SnomedSinonimoComponent
    ],
})
export class RUPLibModule {

}
