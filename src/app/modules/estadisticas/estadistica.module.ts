import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
import { RupPacientesComponent } from './components/rup/rup-pacientes.component';

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
    providers: []
})
export class EstadisticaModule {
}
