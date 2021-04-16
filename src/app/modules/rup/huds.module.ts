import { PlexModule } from '@andes/plex';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoutingHudsGuard } from 'src/app/app.routings-guard.class';
import { EpidemiologiaModule } from '../epidemiologia/epidemiologia.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { HudsBusquedaPacienteComponent } from './components/ejecucion/hudsBusquedaPaciente.component';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { ElementosRUPModule } from './elementos-rup.module';
import { HUDSLibModule } from './huds-lib.module';
import { RUPLibModule } from './rup-lib.module';

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
        RouterModule.forChild([
            { path: '', component: HudsBusquedaPacienteComponent, pathMatch: 'full' },
            { path: 'paciente/:id', component: VistaHudsComponent, canActivate: [RoutingHudsGuard] },
        ]),
    ],
    declarations: [
        HudsBusquedaPacienteComponent,
        VistaHudsComponent
    ]
})
export class HUDSModule {
}
