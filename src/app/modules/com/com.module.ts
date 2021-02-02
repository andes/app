import { ActualizarEstadoDerivacionComponent } from './components/actualizar-estado.component';
import { ReglasDerivacionService } from './../../services/com/reglasDerivaciones.service';
import { TipoTrasladoService } from './../../services/com/tipoTraslados.service';
import { HistorialDerivacionComponent } from './components/historial-derivacion.component';
import { ComPuntoInicioComponent } from './components/punto-inicio.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ElementosRUPModule } from '../rup/elementos-rup.module';
import { COMRouting } from './com.routing';
import { ComBusquedaPacienteComponent } from './components/busqueda-paciente.component';
import { DetalleDerivacionComponent } from './components/detalle-derivacion.component';
import { NuevaDerivacionComponent } from './components/nueva-derivacion/nueva-derivacion.component';
import { TipoTrasladoComponent } from './components/tipo-traslado/tipo-traslado';
import { PuntoInicioService } from './services/punto-inicio.service';


export const COM_COMPONENTS = [
    ComPuntoInicioComponent,
    ComBusquedaPacienteComponent,
    NuevaDerivacionComponent,
    DetalleDerivacionComponent,
    HistorialDerivacionComponent,
    ActualizarEstadoDerivacionComponent,
    TipoTrasladoComponent
];

export const COM_PROVIDERS = [
    DerivacionesService,
    ReglasDerivacionService,
    TipoTrasladoService,
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
        DirectiveLibModule,
        ElementosRUPModule
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
