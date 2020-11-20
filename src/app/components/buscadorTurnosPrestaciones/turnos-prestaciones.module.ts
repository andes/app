import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { TurnosPrestacionesComponent } from './turnos-prestaciones.component';
import { ElementosRUPModule } from 'src/app/modules/rup/elementos-rup.module';
import { ExportHudsService } from 'src/app/modules/visualizacion-informacion/services/export-huds.service';
import { VisualizacionInformacionModule } from 'src/app/modules/visualizacion-informacion/visualizacion-informacion.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        InfiniteScrollModule,
        ElementosRUPModule,
        VisualizacionInformacionModule,
        RouterModule.forChild([
            { path: '', component: TurnosPrestacionesComponent, pathMatch: 'full' },
        ])
    ],
    providers: [ExportHudsService],
    declarations: [
        TurnosPrestacionesComponent
    ]
})
export class TurnosPrestacionesModule { }
