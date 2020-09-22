import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ElementosRUPModule } from './elementos-rup.module';
import { NgDragDropModule } from 'ng-drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChartsModule } from 'ng2-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RUPLibModule } from './rup-lib.module';


import { PuntoInicioComponent } from './components/ejecucion/puntoInicio.component';
import { PrestacionCrearComponent } from './components/ejecucion/prestacionCrear.component';
import { PrestacionEjecucionComponent } from './components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/ejecucion/prestacionValidacion.component';
import { PlantillasRUPComponent } from '../../apps/rup/plantillas-rup/plantillas-rup.component';
import { HelpSolicitudComponent } from './components/ejecucion/help-solicitud.component';
import { SnomedBuscarComponent } from '../../components/snomed/snomed-buscar.component';
import { TOPLibModule } from '../../components/top/top.module';
import { DirectiveLibModule } from '../../directives/directives.module';
import { CITASLibModule } from '../../components/turnos/citas.module';
import { DinamicaFormComponent } from '../../components/turnos/autocitar/dinamica.component';
import { AutocitarTurnoAgendasComponent } from '../../components/turnos/autocitar/autocitar.component';
import { SnomedLinkComponent } from './directives/snomed-link';
import { HUDSLibModule } from './huds-lib.module';
import { BuscadorComponent } from './components/ejecucion/buscador.component';
import { RupRelacionesComponent } from './components/huds/relaciones-rup.component';



export const RUP_COMPONENTS = [
    PuntoInicioComponent,
    PrestacionCrearComponent,
    PrestacionEjecucionComponent,
    PrestacionValidacionComponent,
    PlantillasRUPComponent,
    HelpSolicitudComponent,
    SnomedBuscarComponent,
    DinamicaFormComponent,
    AutocitarTurnoAgendasComponent,
    SnomedLinkComponent,
    BuscadorComponent,
    RupRelacionesComponent
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
        RouterModule.forChild([
            { path: '', component: PuntoInicioComponent, pathMatch: 'full' },
            { path: 'crear/:opcion', component: PrestacionCrearComponent },
            { path: 'ejecucion/:id', component: PrestacionEjecucionComponent },
            { path: 'validacion/:id', component: PrestacionValidacionComponent },
            { path: 'plantillas', component: PlantillasRUPComponent }
        ])
    ],
    declarations: [
        ...RUP_COMPONENTS
    ],
    exports: [],
})
export class RUPModule {

}
