import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalMotivoAccesoHudsComponent } from './components/huds/modal-motivo-acceso-huds.component';
import { RUPCardComponent } from './components/huds/rup-card/rup-card.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
    ],
    declarations: [
        ModalMotivoAccesoHudsComponent,
        RUPCardComponent
    ],
    entryComponents: [
        ModalMotivoAccesoHudsComponent
    ],
    exports: [
        ModalMotivoAccesoHudsComponent,
        RUPCardComponent
    ],
})
export class RUPLibModule {

}
