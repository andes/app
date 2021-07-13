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
import { PlanIndicacionesResumenComponent } from 'src/app/apps/rup/mapa-camas/components/plan-indicaciones-resumen.component';
import { PlantillasRUPComponent } from '../../apps/rup/plantillas-rup/plantillas-rup.component';
import { SnomedBuscarComponent } from '../../components/snomed/snomed-buscar.component';
import { TOPLibModule } from '../../components/top/top.module';
import { AutocitarTurnoAgendasComponent } from '../../components/turnos/autocitar/autocitar.component';
import { DinamicaFormComponent } from '../../components/turnos/autocitar/dinamica.component';
import { CITASLibModule } from '../../components/turnos/citas.module';
import { DirectiveLibModule } from '../../directives/directives.module';
import { EpidemiologiaModule } from '../epidemiologia/epidemiologia.module';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { BuscadorComponent } from './components/ejecucion/buscador.component';
import { HelpSolicitudComponent } from './components/ejecucion/help-solicitud.component';
import { PrestacionCrearComponent } from './components/ejecucion/prestacionCrear.component';
import { PrestacionEjecucionComponent } from './components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/ejecucion/prestacionValidacion.component';
import { PuntoInicioComponent } from './components/ejecucion/puntoInicio.component';
import { RupRelacionesComponent } from './components/huds/relaciones-rup.component';
import { RUPServicioIntermedioAltaComponent } from './components/servicio-intermedio/servicio-intermedio-alta.component';
import { SnomedLinkComponent } from './directives/snomed-link';
import { SnomedSinonimoComponent } from './directives/snomed-sinonimo';
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
    SnomedBuscarComponent,
    DinamicaFormComponent,
    AutocitarTurnoAgendasComponent,
    SnomedLinkComponent,
    BuscadorComponent,
    RupRelacionesComponent,
    SnomedSinonimoComponent,
    RUPServicioIntermedioAltaComponent,
    PlanIndicacionesResumenComponent
];

export const RUP_PROVIDERS = [
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
