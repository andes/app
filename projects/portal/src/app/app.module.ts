import { BrowserModule } from '@angular/platform-browser';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlexModule } from '@andes/plex';
import { Server, SharedModule } from '@andes/shared';

// Declarations
import { HomeComponent } from './home/home.component';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { PortalPacienteMainComponent } from './portal-paciente/portal-paciente-main.component';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';

export const PDP_PROVIDERS = [
  Server,
  FormGroupDirective
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PortalPacienteComponent,
    PacienteDetalleComponent,
    PortalPacienteMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlexModule.forRoot({ networkLoading: true }),
    HttpClientModule,
    InfiniteScrollModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: PDP_PROVIDERS,
  bootstrap: [AppComponent]
})
export class AppModule { }
