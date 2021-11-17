import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AndesCommonModule } from 'src/app/andes-common.module';
import { ElementosRUPModule } from 'src/app/modules/rup/elementos-rup.module';
import { RUPLibModule } from 'src/app/modules/rup/rup-lib.module';
import { RupEjecucionService } from 'src/app/modules/rup/services/ejecucion.service';
import { PlanIndicacionesResumenComponent } from '../../components/plan-indicaciones-resumen.component';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { IndicacionDetalleComponent } from './indicacion-detalle/indicacion-detalle.component';
import { IndicacionColorPipe } from './indicacion-estado-color.pipes';
import { IndicacionLabelPipe } from './indicacion-estado-nombre.pipe';
import { PlanIndicacionEventoComponent } from './indicacion-eventos/indicacion-eventos.component';
import { PlanIndicacionesBotoneraComponent } from './indicaciones-botonera/indicaciones-botonera.component';
import { PlanIndicacionesNuevaIndicacionComponent } from './nueva-indicacion/nueva-indicacion.component';
import { PlanIndicacionesComponent } from './plan-indicaciones.component';

@NgModule({
    imports: [
        AndesCommonModule,
        ElementosRUPModule,
        RUPLibModule,
        RouterModule.forChild([
            { path: ':idInternacion', component: PlanIndicacionesComponent, pathMatch: 'full' },
        ])
    ],
    declarations: [
        PlanIndicacionesComponent,
        PlanIndicacionEventoComponent,
        IndicacionDetalleComponent,
        IndicacionColorPipe,
        IndicacionLabelPipe,
        PlanIndicacionesResumenComponent,
        PlanIndicacionesBotoneraComponent,
        PlanIndicacionesNuevaIndicacionComponent
    ],
    exports: [
        IndicacionColorPipe,
        IndicacionLabelPipe,
        PlanIndicacionesResumenComponent
    ],
    providers: [
        { provide: RupEjecucionService, useClass: PlanIndicacionesServices }
    ]
})
export class MapaCamasPlanIndicacionModule {

}
