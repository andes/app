import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Providers
import { EstAgendasService } from './services/agenda.service';

// Components
import { HomeComponent } from './components/home.component';
import { FiltrosComponent } from './components/citas/filtros.component';

// Module
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { CitasComponent } from './components/citas/citas.component';
import { EstadisticasRouting } from './estadisticas.routing';
import { CommonModule } from '@angular/common';
import { EstRupService } from './services/rup-estadisticas.service';
import { RupPacientesComponent } from './components/rup/rup-pacientes.component';
import { SnomedService } from './services/snomed.service';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        AuthModule,
        ChartsModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
        EstadisticasRouting
    ],
    declarations: [
        HomeComponent,
        FiltrosComponent,
        CitasComponent,
        RupPacientesComponent
    ],
    entryComponents: [
        HomeComponent,
        FiltrosComponent,
        CitasComponent,
        RupPacientesComponent
    ],
    exports: [],
    providers: [
        EstAgendasService,
        EstRupService,
        SnomedService
    ]
})
export class EstadisticaModule {
}
