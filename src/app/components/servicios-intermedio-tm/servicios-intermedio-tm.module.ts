import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { DirectiveLibModule } from '../../directives/directives.module';
import { MitosModule } from '../../apps/mitos';
import { ServiciosIntermedioListadoComponent } from './servicios-intermedio-listado.component';
import { ServiciosIntermedioCreateUpdateComponent } from './servicios-intermedio-create-update.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PlexModule,
        SharedModule,
        HttpClientModule,
        DirectiveLibModule,
        MitosModule,
        RouterModule.forChild([
            { path: '', component: ServiciosIntermedioListadoComponent, pathMatch: 'full' },
            { path: 'create', component: ServiciosIntermedioCreateUpdateComponent },
            { path: 'create/:id', component: ServiciosIntermedioCreateUpdateComponent },
        ])
    ],
    declarations: [
        ServiciosIntermedioListadoComponent,
        ServiciosIntermedioCreateUpdateComponent,
    ],
})
export class ServiciosIntermedioTmModule {

}
