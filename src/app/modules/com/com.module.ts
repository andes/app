import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ElementosRUPModule } from '../rup/elementos-rup.module';
import { SemaforoModule } from '../semaforo-priorizacion/semaforo-priorizacion.module';
import { ReglasDerivacionService } from './../../services/com/reglasDerivaciones.service';
import { TipoTrasladoService } from './../../services/com/tipoTraslados.service';
import { DispositivoService } from './../../services/dispositivo/dispositivo.service';
import { DispositivoComponent } from './../dispositivo/dispositivo.component';
import { COMRouting } from './com.routing';
import { ActualizarEstadoDerivacionComponent } from './components/actualizar-estado.component';
import { ComBusquedaPacienteComponent } from './components/busqueda-paciente.component';
import { DetalleDerivacionComponent } from './components/detalle-derivacion.component';
import { HistorialDerivacionComponent } from './components/historial-derivacion.component';
import { NuevaDerivacionComponent } from './components/nueva-derivacion/nueva-derivacion.component';
import { ComPuntoInicioComponent } from './components/punto-inicio.component';
import { TipoTrasladoComponent } from './components/tipo-traslado/tipo-traslado';
import { PuntoInicioService } from './services/punto-inicio.service';


export const COM_COMPONENTS = [
    ComPuntoInicioComponent,
    ComBusquedaPacienteComponent,
    NuevaDerivacionComponent,
    DetalleDerivacionComponent,
    HistorialDerivacionComponent,
    ActualizarEstadoDerivacionComponent,
    TipoTrasladoComponent,
    DispositivoComponent,
];

export const COM_PROVIDERS = [
    DerivacionesService,
    ReglasDerivacionService,
    TipoTrasladoService,
    PuntoInicioService,
    DispositivoService
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
        DirectiveLibModule,
        ElementosRUPModule,
        SemaforoModule
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
