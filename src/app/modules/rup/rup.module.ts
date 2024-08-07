import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';
import { ChartsModule } from 'ng2-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
import { PlantillasRUPComponent } from '../../apps/rup/plantillas-rup/plantillas-rup.component';
import { TOPLibModule } from '../../components/top/top.module';
import { AutocitarTurnoAgendasComponent } from '../../components/turnos/autocitar/autocitar.component';
import { CITASLibModule } from '../../components/turnos/citas.module';
import { DirectiveLibModule } from '../../directives/directives.module';
import { EpidemiologiaModule } from '../epidemiologia/epidemiologia.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { RupAsignarTurnoComponent } from './components/ejecucion/dacion-turno/asignar-turno';
import { HelpSolicitudComponent } from './components/ejecucion/help-solicitud.component';
import { PrestacionCrearComponent } from './components/ejecucion/prestacionCrear.component';
import { PrestacionEjecucionComponent } from './components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/ejecucion/prestacionValidacion.component';
import { PuntoInicioComponent } from './components/ejecucion/puntoInicio.component';
import { RupRelacionesComponent } from './components/huds/relaciones-rup.component';
import { RUPServicioIntermedioAltaComponent } from './components/servicio-intermedio/servicio-intermedio-alta.component';
import { ElementosRUPModule } from './elementos-rup.module';
import { HUDSLibModule } from './huds-lib.module';
import { RUPLibModule } from './rup-lib.module';


export const RUP_COMPONENTS = [
    PuntoInicioComponent,
    PrestacionCrearComponent,
    PrestacionEjecucionComponent,
    PrestacionValidacionComponent,
    PlantillasRUPComponent,
    HelpSolicitudComponent,
    RupAsignarTurnoComponent,
    AutocitarTurnoAgendasComponent,
    RupRelacionesComponent,
    RUPServicioIntermedioAltaComponent
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        MPILibModule,
        ElementosRUPModule,
        RUPLibModule,
        TOPLibModule,
        DirectiveLibModule,
        CITASLibModule,
        NgDragDropModule,
        ScrollingModule,
        ChartsModule,
        InfiniteScrollModule,
        HUDSLibModule,
        EpidemiologiaModule,
        RouterModule.forChild([
            { path: '', component: PuntoInicioComponent, pathMatch: 'full' },
            { path: 'crear/:opcion', component: PrestacionCrearComponent },
            { path: 'ejecucion/:id', component: PrestacionEjecucionComponent },
            { path: 'validacion/:id', component: PrestacionValidacionComponent },
            { path: 'plantillas', component: PlantillasRUPComponent, pathMatch: 'full' }
        ])
    ],
    declarations: [
        ...RUP_COMPONENTS
    ],
    providers: [
        MotivosHudsService],
    exports: []
})
export class RUPModule {

}
