import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { MPILibModule } from '../../../modules/mpi/mpi-lib.module';


import { MapaCamasRouting } from './mapa-camas.routing';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { MapaCamasCapaComponent } from './views/mapa-camas-capa/mapa-camas-capa.component';
import { CensosDiariosComponent } from './views/censos/censo-diario/censo-diario.component';
import { CensosMensualesComponent } from './views/censos/censo-mensual/censo-mensual.component';
import { FiltrosCamasComponent } from './views/mapa-camas-capa/filtros-cama/filtros-camas.component';
import { CamaMainComponent } from './views/cama/cama.component';
import { EstadoServicioComponent } from './sidebar/estado-servicio/estado-servicio.component';
import { ItemCamaComponent } from './views/mapa-camas-capa/item-cama/item-cama.component';
import { IngresarPacienteComponent } from './sidebar/ingreso/ingresar-paciente.component';
import { IconoCamitaComponent } from './sidebar/estado-servicio/iconito-cama/icono-camita.component';
import { CamaDestinoGenericoComponent } from './sidebar/cama-destino-generico.component';
import { CamaDesocuparComponent } from './sidebar/desocupar-cama.component';
import { EgresarPacienteComponent } from './sidebar/egreso/egresar-paciente.component';
import { CamaDetalleComponent } from './sidebar/cama-detalle/cama-detalle.component';
import { InternacionDetalleComponent } from './sidebar/internacion-detalle.component';
import { InformeIngresoComponent } from './sidebar/ingreso/informe-ingreso.component';
import { InformeEgresoComponent } from './sidebar/egreso/informe-egreso.component';
import { HistorialDetalleComponent } from './sidebar/cama-detalle/historial-detalle/historial-detalle.component';
import { MovimientosInternacionComponent } from './sidebar/movimientos-internacion/movimientos-internacion.component';
import { CambiarCamaComponent } from './sidebar/cambiar-cama.component';
import { InternacionListadoComponent } from './views/listado-internacion/listado-internacion.component';
import { InternacionListaEsperaComponent } from './views/lista-espera/lista-espera.component';

import { MapaCamasService } from './services/mapa-camas.service';
import { MapaCamasHTTP } from './services/mapa-camas.http';
import { MitosModule } from '../../mitos';
import { OrganizacionLibModule } from '../../../components/organizacion/organizacion-lib.module';


@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        MapaCamasRouting,
        SharedModule,
        MPILibModule,
        MitosModule,
        OrganizacionLibModule
    ],
    declarations: [
        MapaCamasMainComponent,
        MapaCamasCapaComponent,
        CensosDiariosComponent,
        CensosMensualesComponent,
        FiltrosCamasComponent,
        CamaMainComponent,
        EstadoServicioComponent,
        ItemCamaComponent,
        IngresarPacienteComponent,
        IconoCamitaComponent,
        CamaDestinoGenericoComponent,
        CamaDesocuparComponent,
        EgresarPacienteComponent,
        CamaDetalleComponent,
        InternacionDetalleComponent,
        InformeIngresoComponent,
        InformeEgresoComponent,
        HistorialDetalleComponent,
        MovimientosInternacionComponent,
        CambiarCamaComponent,
        InternacionListadoComponent,
        InternacionListaEsperaComponent
    ],
    providers: [
        MapaCamasService,
        MapaCamasHTTP
    ],
    exports: [],
})
export class MapaCamasModule {

}
