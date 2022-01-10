import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoutingHudsGuard } from 'src/app/app.routings-guard.class';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { EpidemiologiaModule } from '../epidemiologia/epidemiologia.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { HudsBusquedaPacienteComponent } from './components/ejecucion/hudsBusquedaPaciente.component';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { ElementosRUPModule } from './elementos-rup.module';
import { HUDSLibModule } from './huds-lib.module';
import { RUPLibModule } from './rup-lib.module';
import { HUDSTimelineComponent } from './views/huds-timeline/huds-timeline.component';
@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        RUPLibModule,
        MPILibModule,
        HUDSLibModule,
        ElementosRUPModule,
        EpidemiologiaModule,
        SharedModule,
        DirectiveLibModule,
        RouterModule.forChild([
            { path: '', component: HudsBusquedaPacienteComponent, pathMatch: 'full' },
            { path: 'paciente/:id', component: VistaHudsComponent, canActivate: [RoutingHudsGuard] },
            { path: 'timeline/:id', component: HUDSTimelineComponent },
        ]),
    ],
    declarations: [
        HudsBusquedaPacienteComponent,
        VistaHudsComponent,
        HUDSTimelineComponent
    ],
    providers: [
    ]
})
export class HUDSModule {
}
