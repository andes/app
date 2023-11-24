import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { TurnosPrestacionesComponent } from './turnos-prestaciones.component';
import { NoNominalizadasComponent } from './no-nominalizadas/no-nominalizadas.component';
import { ElementosRUPModule } from 'src/app/modules/rup/elementos-rup.module';
import { ExportHudsService } from 'src/app/modules/visualizacion-informacion/services/export-huds.service';
import { VisualizacionInformacionModule } from 'src/app/modules/visualizacion-informacion/visualizacion-informacion.module';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { CITASLibModule } from '../turnos/citas.module';

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
        ScrollingModule,
        MPILibModule,
        CITASLibModule,
        RouterModule.forChild([
            { path: '', component: TurnosPrestacionesComponent, pathMatch: 'full' },
            { path: 'no_nominalizadas', component: NoNominalizadasComponent, pathMatch: 'full' },
        ])
    ],
    providers: [ExportHudsService],
    declarations: [
        TurnosPrestacionesComponent,
        NoNominalizadasComponent
    ]
})
export class TurnosPrestacionesModule { }
