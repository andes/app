import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { HistorialTurnosComponent } from './historial-turnos.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        SharedModule,
        DirectiveLibModule
    ],
    declarations: [
        HistorialTurnosComponent
    ],
    exports: [
        HistorialTurnosComponent
    ]
})
export class HistorialTurnosModule { }
