import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { MPILibModule } from '../../../modules/mpi/mpi-lib.module';
import { ScrollDispatcher, ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';

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
import { CamaDestinoGenericoComponent } from './sidebar/cama-destino-generico/cama-destino-generico.component';
import { CamaDesocuparComponent } from './sidebar/desocupar-cama/desocupar-cama.component';
import { EgresarPacienteComponent } from './sidebar/egreso/egresar-paciente.component';
import { CamaDetalleComponent } from './sidebar/cama-detalle/cama-detalle.component';
import { InternacionDetalleComponent } from './sidebar/cama-detalle/internacion-detalle/internacion-detalle.component';
import { InformeIngresoComponent } from './sidebar/ingreso/informe-ingreso.component';
import { InformeEgresoComponent } from './sidebar/egreso/informe-egreso.component';
import { HistorialDetalleComponent } from './sidebar/cama-detalle/historial-detalle/historial-detalle.component';
import { MovimientosInternacionComponent } from './sidebar/movimientos-internacion/movimientos-internacion.component';
import { CambiarCamaComponent } from './sidebar/desocupar-cama/cambiar-cama.component';
import { InternacionListadoComponent } from './views/listado-internacion/listado-internacion.component';
import { InternacionListaEsperaComponent } from './views/lista-espera/lista-espera.component';

import { MapaCamasService } from './services/mapa-camas.service';
import { MitosModule } from '../../mitos';
import { OrganizacionLibModule } from '../../../components/organizacion/organizacion-lib.module';
import { ElegirPacienteComponent } from './sidebar/ingreso/elegir-paciente.component';
import { FiltrosInternacionComponent } from './views/listado-internacion/filtros-internacion/filtros-internacion.component';
import { NuevoRegistroSaludComponent } from './sidebar/nuevo-registro-salud/nuevo-registro-salud.component';
import { MaquinaEstadosHTTP } from './services/maquina-estados.http';
import { ListadoInternacionService } from './views/listado-internacion/listado-internacion.service';
import { RegistrosHudsDetalleComponent } from './sidebar/registros-huds-detalle/registros-huds-detalle.component';
import { ElementosRUPModule } from '../../../modules/rup/elementos-rup.module';
import { RegistroHUDSItemComponent } from './sidebar/registros-huds-detalle/registros-huds-item/registros-huds-item.component';
import { IngresoPacienteWorkflowComponent } from './sidebar/ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.component';
import { SalaComunComponent } from './views/sala-comun/sala-comun.component';
import { SalaComunService } from './views/sala-comun/sala-comun.service';
import { NgDragDropModule } from 'ng-drag-drop';
import { RUPLibModule } from '../../../modules/rup/rup-lib.module';
import { IntegridadCamasComponent } from './views/integridad/integridad-camas.component';
import { ItemInconsistenciaComponent } from './views/integridad/item-inconsistencia/item-inconsistencia.component';
import { IntegridadService } from './views/integridad/integridad.service';
import { DetalleIntegridadComponent } from './views/integridad/detalle/detalle-integridad.component';
import { FiltrosInconsistenciasComponent } from './views/integridad/filtros-inconsistencia/filtros-inconsistencias.component';
import { PermisosMapaCamasService } from './services/permisos-mapa-camas.service';

export const INTERNACION_COMPONENTS = [
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
    InternacionListaEsperaComponent,
    ElegirPacienteComponent,
    FiltrosInternacionComponent,
    NuevoRegistroSaludComponent,
    RegistrosHudsDetalleComponent,
    RegistroHUDSItemComponent,
    IngresoPacienteWorkflowComponent,
    SalaComunComponent,
    IntegridadCamasComponent,
    ItemInconsistenciaComponent,
    DetalleIntegridadComponent,
    FiltrosInconsistenciasComponent,
];

export const INTERNACION_PROVIDERS = [
    MapaCamasService,
    MaquinaEstadosHTTP,
    ListadoInternacionService,
    SalaComunService,
    ScrollDispatcher,
    IntegridadService,
    PermisosMapaCamasService,
];

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
        OrganizacionLibModule,
        ElementosRUPModule,
        NgDragDropModule,
        RUPLibModule,
        ScrollingModule,
        CdkTableModule
    ],
    declarations: [
        ...INTERNACION_COMPONENTS
    ],
    providers: [
        ...INTERNACION_PROVIDERS
    ],
    exports: [],
})
export class MapaCamasModule {

}
