import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AndesCommonModule } from 'src/app/andes-common.module';
import { ElementosRUPModule } from 'src/app/modules/rup/elementos-rup.module';
import { RUPLibModule } from 'src/app/modules/rup/rup-lib.module';
import { PlanIndicacionesResumenComponent } from '../../components/plan-indicaciones-resumen.component';
import { IndicacionDetalleComponent } from './indicacion-detalle/indicacion-detalle.component';
import { IndicacionColorPipe } from './indicacion-estado-color.pipes';
import { IndicacionLabelPipe } from './indicacion-estado-nombre.pipe';
import { PlanIndicacionEventoComponent } from './indicacion-eventos/indicacion-eventos.component';
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
        PlanIndicacionesResumenComponent
    ],
    exports: [
        IndicacionColorPipe,
        IndicacionLabelPipe,
        PlanIndicacionesResumenComponent
    ],
})
export class MapaCamasPlanIndicacionModule {

}
