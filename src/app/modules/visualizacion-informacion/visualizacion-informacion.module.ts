import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { VisualizacioninfromacionRounting } from './visualizacion-informacion.routing';
import { VisualizacionInformacionComponent } from './components/visualizacion-informacion.component';
import { BiQueriesComponent } from './components/bi-queries/bi-queries.component';

@NgModule({
    declarations: [
        VisualizacionInformacionComponent,
        BiQueriesComponent],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PlexModule,
        VisualizacioninfromacionRounting
    ],
    providers: []
})
export class VisualizacionInformacionModule { }
