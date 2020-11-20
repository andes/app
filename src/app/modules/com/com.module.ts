import { ActualizarEstadoDerivacionComponent } from './components/actualizar-estado.component';
import { ReglasDerivacionService } from './../../services/com/reglasDerivaciones.service';
import { COMAdjuntosService } from './../../services/com/adjuntos.service';
import { HistorialDerivacionComponent } from './components/historial-derivacion.component';
import { ComPuntoInicioComponent } from './components/punto-inicio.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { COMRouting } from './com.routing';
import { ComBusquedaPacienteComponent } from './components/busqueda-paciente.component';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { NuevaDerivacionComponent } from './components/nueva-derivacion/nueva-derivacion.component';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { DetalleDerivacionComponent } from './components/detalle-derivacion.component';
import { PuntoInicioService } from './services/punto-inicio.service';

export const COM_COMPONENTS = [
    ComPuntoInicioComponent,
    ComBusquedaPacienteComponent,
    NuevaDerivacionComponent,
    DetalleDerivacionComponent,
    HistorialDerivacionComponent,
    ActualizarEstadoDerivacionComponent
];

export const COM_PROVIDERS = [
    COMAdjuntosService,
    DerivacionesService,
    ReglasDerivacionService,
    PuntoInicioService
];

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        COMRouting,
        SharedModule,
        InfiniteScrollModule,
        MPILibModule,
        DirectiveLibModule
    ],
    declarations: [
        ...COM_COMPONENTS
    ],
    providers: [
        ...COM_PROVIDERS
    ],
    exports: [],
})
export class COMModule {

}
