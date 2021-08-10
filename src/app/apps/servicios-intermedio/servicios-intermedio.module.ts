import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { MitosModule } from '../mitos';
import { ServicioIntermedioNombrePipe } from './pipes/servicio-intermedio-nombre.pipes';
import { ServicioIntermedioCRUDComponent } from './views/servicio-intermedio-crud/servicio-intermedio-crud.component';
import { ServicioIntermedioListadoComponent } from './views/servicio-intermedio-listado/servicio-intermedio-listado.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        MitosModule,
        RouterModule.forChild([
            { path: 'listado', component: ServicioIntermedioListadoComponent, pathMatch: 'full' },
            { path: 'nuevo', component: ServicioIntermedioCRUDComponent, pathMatch: 'full' },
            { path: ':id', component: ServicioIntermedioCRUDComponent, pathMatch: 'full' },
        ])
    ],
    declarations: [
        ServicioIntermedioListadoComponent,
        ServicioIntermedioCRUDComponent,
        ServicioIntermedioNombrePipe
    ],
    exports: [
        ServicioIntermedioNombrePipe
    ]
})
export class ServicioIntermedioModule {

}
