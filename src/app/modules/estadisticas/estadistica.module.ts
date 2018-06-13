import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatCheckboxModule } from '@angular/material';

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

@NgModule({
    imports: [
        BrowserModule,
        PlexModule,
        AuthModule,
        ChartsModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
    ],
    declarations: [
        HomeComponent,
        FiltrosComponent
    ],
    entryComponents: [
        HomeComponent,
        FiltrosComponent
    ],
    exports: [],
    providers: [
        EstAgendasService
    ]
})
export class EstadisticaModule {
}
