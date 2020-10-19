import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { SortBloquesPipe } from '../../pipes/agenda-bloques.pipe';
import { EspacioFisicoPipe } from '../../pipes/espacioFisico.pipe';
import { DarTurnosComponent } from './dar-turnos/dar-turnos.component';
import { CalendarioComponent } from './dar-turnos/calendario.component';
import { DirectiveLibModule } from '../../directives/directives.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
    ],
    declarations: [
        DarTurnosComponent,
        CalendarioComponent,
        SortBloquesPipe,
        EspacioFisicoPipe
    ],
    exports: [
        DarTurnosComponent,
        SortBloquesPipe,
        EspacioFisicoPipe,
        CalendarioComponent
    ],
})
export class CITASLibModule {

}
