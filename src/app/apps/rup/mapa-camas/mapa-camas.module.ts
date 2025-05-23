import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ScrollDispatcher, ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { OrganizacionLibModule } from '../../../components/organizacion/organizacion-lib.module';
import { MPILibModule } from '../../../modules/mpi/mpi-lib.module';
import { ElementosRUPModule } from '../../../modules/rup/elementos-rup.module';
import { RUPLibModule } from '../../../modules/rup/rup-lib.module';
import { MitosModule } from '../../mitos';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { MapaCamasRouting } from './mapa-camas.routing';
import { MapaCamasService } from './services/mapa-camas.service';
import { MaquinaEstadosHTTP } from './services/maquina-estados.http';
import { PermisosMapaCamasService } from './services/permisos-mapa-camas.service';
import { PlanIndicacionesEventosServices } from './services/plan-indicaciones-eventos.service';
import { CamaDestinoGenericoComponent } from './sidebar/cama-destino-generico/cama-destino-generico.component';
import { CamaDetalleComponent } from './sidebar/cama-detalle/cama-detalle.component';
import { HistorialDetalleComponent } from './sidebar/cama-detalle/historial-detalle/historial-detalle.component';
import { InternacionDetalleComponent } from './sidebar/cama-detalle/internacion-detalle/internacion-detalle.component';
import { CambiarCamaComponent } from './sidebar/desocupar-cama/cambiar-cama.component';
import { CamaDesocuparComponent } from './sidebar/desocupar-cama/desocupar-cama.component';
import { EgresarPacienteComponent } from './sidebar/egreso/egresar-paciente.component';
import { InformeEgresoComponent } from './sidebar/egreso/informe-egreso.component';
import { InformeIngresoEstadisticaV2Component } from './sidebar/ingreso/informe-ingreso-estadistica-v2.component';
import { EstadoServicioComponent } from './sidebar/estado-servicio/estado-servicio.component';
import { IconoCamitaComponent } from './sidebar/estado-servicio/iconito-cama/icono-camita.component';
import { IngresoDinamicoComponent } from './sidebar/ingreso-dinamico/ingreso-dinamico.component';
import { ElegirPacienteComponent } from './sidebar/ingreso/elegir-paciente.component';
import { InformeIngresoComponent } from './sidebar/ingreso/informe-ingreso.component';
import { IngresarPacienteComponent } from './sidebar/ingreso/ingresar-paciente.component';
import { IngresoPacienteWorkflowComponent } from './sidebar/ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.component';
import { MovimientosInternacionComponent } from './sidebar/movimientos-internacion/movimientos-internacion.component';
import { NuevoRegistroSaludComponent } from './sidebar/nuevo-registro-salud/nuevo-registro-salud.component';
import { PrestarDevolverRecursoComponent } from './sidebar/prestar-devolver-recurso/prestar-devolver-recurso.component';
import { RegistrosHudsDetalleComponent } from './sidebar/registros-huds-detalle/registros-huds-detalle.component';
import { RegistroHUDSItemComponent } from './sidebar/registros-huds-detalle/registros-huds-item/registros-huds-item.component';
import { CamaMainComponent } from './views/cama/cama.component';
import { CensosDiariosComponent } from './views/censos/censo-diario/censo-diario.component';
import { CensosMensualesComponent } from './views/censos/censo-mensual/censo-mensual.component';
import { DetalleIntegridadComponent } from './views/integridad/detalle/detalle-integridad.component';
import { FiltrosInconsistenciasComponent } from './views/integridad/filtros-inconsistencia/filtros-inconsistencias.component';
import { IntegridadCamasComponent } from './views/integridad/integridad-camas.component';
import { IntegridadService } from './views/integridad/integridad.service';
import { ItemInconsistenciaComponent } from './views/integridad/item-inconsistencia/item-inconsistencia.component';
import { InternacionListaEsperaComponent } from './views/lista-espera/lista-espera.component';
import { FiltrosListadoCapasComponent } from './views/listado-internacion-capas/filtros-listado/filtros-listado-capas.component';
import { ListadoInternacionCapasComponent } from './views/listado-internacion-capas/listado-internacion-capas.component';
import { ListadoInternacionUnificadoComponent } from './views/listado-internacion-capas/listado-internacion-unificado.component';
import { FiltrosInternacionComponent } from './views/listado-internacion/filtros-internacion/filtros-internacion.component';
import { InternacionListadoComponent } from './views/listado-internacion/listado-internacion.component';
import { ListadoInternacionService } from './views/listado-internacion/listado-internacion.service';
import { FiltrosCamasComponent } from './views/mapa-camas-capa/filtros-cama/filtros-camas.component';
import { ItemCamaComponent } from './views/mapa-camas-capa/item-cama/item-cama.component';
import { MapaCamasCapaComponent } from './views/mapa-camas-capa/mapa-camas-capa.component';
import { RecursosListadoComponent } from './views/mapa-camas-capa/recursos-listado/recursos-listado.component';
import { ResumenInternacionComponent } from './views/resumen-internacion/resumen-internacion.component';
import { SalaComunComponent } from './views/sala-comun/sala-comun.component';
import { SalaComunService } from './views/sala-comun/sala-comun.service';
import { TimelineMapaCamasComponent } from './views/timelinea-mapa-camas/timeline-mapa-camas.component';
import { VistaCDAComponent } from './views/mapa-camas-capa/vista-cda/vista-cda.component';
import { IngresoPacienteService } from './sidebar/ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { PeriodosCensablesComponent } from './sidebar/periodos-censables/periodos-censables.component';
import { ListadoMedicamentosCapasComponent } from './views/listado-internacion-capas/listado-medicamentos-capas.component';
import { CITASLibModule } from '../../../components/turnos/citas.module';

export const INTERNACION_COMPONENTS = [
    MapaCamasMainComponent,
    MapaCamasCapaComponent,
    VistaCDAComponent,
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
    InformeIngresoEstadisticaV2Component,
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
    IngresoDinamicoComponent,
    PrestarDevolverRecursoComponent,
    ListadoInternacionCapasComponent,
    ListadoMedicamentosCapasComponent,
    ListadoInternacionUnificadoComponent,
    FiltrosListadoCapasComponent,
    RecursosListadoComponent,
    ResumenInternacionComponent,
    TimelineMapaCamasComponent,
    PeriodosCensablesComponent
];

export const INTERNACION_PROVIDERS = [
    MapaCamasService,
    MaquinaEstadosHTTP,
    ListadoInternacionService,
    SalaComunService,
    ScrollDispatcher,
    IntegridadService,
    PermisosMapaCamasService,
    PlanIndicacionesEventosServices,
    IngresoPacienteService
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
        CdkTableModule,
        HammerModule,
        DirectiveLibModule,
        CITASLibModule
    ],
    declarations: [
        ...INTERNACION_COMPONENTS,
    ],
    providers: [
        ...INTERNACION_PROVIDERS
    ],
    exports: [
    ],
})
export class MapaCamasModule {

}
