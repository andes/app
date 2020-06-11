import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';

import { RUPTextModalComponent } from './text-modal.component';
import { RUPTextModalDirective } from './text-modal.directive';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
    ],
    declarations: [
        RUPTextModalComponent,
        RUPTextModalDirective
    ],
    exports: [
        RUPTextModalComponent,
        RUPTextModalDirective
    ]
})
export class RUPTextModalModule { }
