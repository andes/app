import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { DirectiveLibModule } from 'src/app/directives/directives.module';

import { VisualizacionReglasComponent } from './reglas/visualizacionReglas.component';
import { HistorialSolicitudComponent } from './solicitudes/historialSolicitud.component';
import { VisualizacionReglasTopComponent } from './reglas/visualizacionReglasTop.component';


export const TOP_COMPONENTS = [
    VisualizacionReglasTopComponent,
    VisualizacionReglasComponent,
    HistorialSolicitudComponent,
];

export const TOP_PROVIDERS = [
];

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
        ...TOP_COMPONENTS
    ],
    providers: [
        ...TOP_PROVIDERS
    ],
    exports: [
        VisualizacionReglasTopComponent,
        VisualizacionReglasComponent,
        HistorialSolicitudComponent
    ],
})
export class TOPLibModule {

}
