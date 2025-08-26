import { FormNuevaSolicitudComponent } from './solicitudes/formNuevaSolicitud.component';
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
import { RouterService } from 'src/app/services/router.service';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';

export const TOP_COMPONENTS = [
    VisualizacionReglasTopComponent,
    VisualizacionReglasComponent,
    HistorialSolicitudComponent,
    FormNuevaSolicitudComponent
];

export const TOP_PROVIDERS = [
    RouterService
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule, //.forRoot({ networkLoading: true }),
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
        MotivosHudsService,
        ...TOP_PROVIDERS
    ],
    exports: [
        VisualizacionReglasTopComponent,
        VisualizacionReglasComponent,
        HistorialSolicitudComponent,
        FormNuevaSolicitudComponent
    ],
})
export class TOPLibModule {

}
