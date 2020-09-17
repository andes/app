import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { VisualizacionReglasComponent } from './reglas/visualizacionReglas.component';
import { HistorialSolicitudComponent } from './solicitudes/historialSolicitud.component';
import { DirectiveLibModule } from '../../directives/directives.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule
    ],
    declarations: [
        VisualizacionReglasComponent,
        HistorialSolicitudComponent
    ],
    exports: [
        VisualizacionReglasComponent,
        HistorialSolicitudComponent
    ],
})
export class TOPLibModule {

}
