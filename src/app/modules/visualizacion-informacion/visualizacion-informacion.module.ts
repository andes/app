import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { VisualizacioninfromacionRounting } from './visualizacion-informacion.routing';
import { VisualizacionInformacionComponent } from './components/visualizacion-informacion.component';
import { BiQueriesComponent } from './components/bi-queries/bi-queries.component';
import { ExportarHudsComponent } from './components/exportar-huds/exportar-huds.component';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ExportHudsService } from './services/export-huds.service';
import { DescargasPendientesComponent } from './components/exportar-huds/descargas-pendientes.component';


@NgModule({
    declarations: [
        VisualizacionInformacionComponent,
        BiQueriesComponent,
        ExportarHudsComponent,
        DescargasPendientesComponent
    ],
    exports: [DescargasPendientesComponent],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PlexModule,
        VisualizacioninfromacionRounting,
        MPILibModule,
        ReactiveFormsModule
    ],
    providers: [ExportHudsService]
})
export class VisualizacionInformacionModule { }
