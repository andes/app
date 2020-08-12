import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { ModalMotivoAccesoHudsComponent } from './components/huds/modal-motivo-acceso-huds.component';

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
    ],
    providers: [

    ],
    entryComponents: [
        ModalMotivoAccesoHudsComponent
    ],
    exports: [
        ModalMotivoAccesoHudsComponent
    ],
})
export class RUPLibModule {

}
