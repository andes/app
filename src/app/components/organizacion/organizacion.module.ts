import { NgModule } from '@angular/core';
import { DirectiveLibModule } from '../../directives/directives.module';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OrganizacionLibModule } from './organizacion-lib.module';
import { RouterModule } from '@angular/router';
import { OrganizacionComponent } from './organizacion.component';
import { OrganizacionSectoresComponent } from './organizacion-sectores.component';
import { OrganizacionOfertaPrestacionalComponent } from './organizacion-prestaciones.component';
import { OrganizacionCreateEmailComponent } from './organizacion-create-email.component';
import { OrganizacionCreateUpdateComponent } from './organizacion-create-update.component';
import { MitosModule } from '../../apps/mitos';
import { ConfiguracionInternacionComponent } from './configuracion-internacion.component';
import { MaquinaEstadosHTTP } from 'src/app/apps/rup/mapa-camas/services/maquina-estados.http';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        OrganizacionLibModule,
        DirectiveLibModule,
        MitosModule,
        RouterModule.forChild([
            { path: '', component: OrganizacionComponent, pathMatch: 'full' },
            { path: ':id/sectores', component: OrganizacionSectoresComponent, },
            { path: ':id/ofertas_prestacionales', component: OrganizacionOfertaPrestacionalComponent, },
            { path: ':id/configuracion', component: OrganizacionCreateEmailComponent },
            { path: ':id/configuracion_internacion', component: ConfiguracionInternacionComponent }
        ]),
        MPILibModule
    ],
    declarations: [
        OrganizacionComponent,
        OrganizacionSectoresComponent,
        OrganizacionOfertaPrestacionalComponent,
        OrganizacionCreateEmailComponent,
        OrganizacionCreateUpdateComponent,
        ConfiguracionInternacionComponent
    ],
    providers: [
        MaquinaEstadosHTTP
    ]
})
export class OrganizacionesModule {

}
