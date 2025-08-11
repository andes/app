import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Providers
import { EstAgendasService } from './services/agenda.service';
import { SolicitudesTopService } from './services/top.service';

// Components
import { FiltrosComponent } from './components/citas/filtros.component';
import { GraficosComponent } from './components/citas/graficos.component';
import { FiltrosSolicitudesComponent } from './components/top/filtrosSolicitudes.component';

// Module
import { PlexModule } from '@andes/plex';
import { NgChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { CitasComponent } from './components/citas/citas.component';
import { EstadisticasRouting } from './estadisticas.routing';
import { CommonModule } from '@angular/common';
import { EstRupService } from './services/rup-estadisticas.service';
import { RupPacientesComponent } from './components/rup/rup-pacientes.component';
import { SnomedService } from './services/snomed.service';
import { Tabla2DComponent } from './components/tabla-2d/tabla-2d.component';
import { TopComponent } from './components/top/top.component';
import { SumPipe } from './pipes/sum.pipe';
import { DirectiveLibModule } from 'src/app/directives/directives.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule.forRoot({ networkLoading: true }),
        NgChartsModule,
        FormsModule,
        HttpClientModule,
        EstadisticasRouting,
        DirectiveLibModule
    ],
    declarations: [
        SumPipe,
        FiltrosComponent,
        FiltrosSolicitudesComponent,
        CitasComponent,
        RupPacientesComponent,
        GraficosComponent,
        Tabla2DComponent,
        TopComponent
    ],
    exports: [],
    providers: [
        EstAgendasService,
        EstRupService,
        SnomedService,
        SolicitudesTopService
    ]
})
export class EstadisticaModule {
}
