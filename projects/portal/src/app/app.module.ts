import { BrowserModule } from '@angular/platform-browser';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlexModule } from '@andes/plex';
import { Server, SharedModule } from '@andes/shared';
import { Auth } from '@andes/auth';

// Declarations
import { LoginComponent } from './pages/login/login-portal-paciente';
import { PortalPacienteComponent } from './pages/portal-paciente/portal-paciente.component';
import { PortalPacienteMainComponent } from './pages/portal-paciente/portal-paciente-main/portal-paciente-main.component';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';
import { RoutingGuard } from './app.routings-guard.class';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { AdjuntosService } from 'src/app/modules/rup/services/adjuntos.service';
import { environment } from '../environments/environment';

import { PDPTituloComponent } from './components/portal-titulo/portal-titulo.component';
import { PDPMisFamiliaresComponent } from './pages/mis-familiares/mis-familiares.component';
import { PDPMenuComponent } from './components/portal-menu/portal-menu.component';
import { PDPMisFamiliaresDetalleComponent } from './pages/mis-familiares/mis-familiares-detalle.component';

import { PrestacionService } from './services/prestaciones.service';
import { MisVacunasComponent } from './pages/portal-paciente/portal-paciente-main/mis-vacunas/mis-vacunas.component';
import { DetalleVacunaComponent } from './pages/portal-paciente/portal-paciente-sidebar/detalle-vacuna/detalle-vacuna.component';
import { MisTurnosComponent } from './pages/portal-paciente/portal-paciente-main/mis-turnos/mis-turnos.component';
import { DetalleTurnoComponent } from './pages/portal-paciente/portal-paciente-sidebar/detalle-turno/detalle-turno.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PacienteDetalleComponent,

    PDPMisFamiliaresComponent,
    PDPTituloComponent,
    PDPMenuComponent,
    PDPMisFamiliaresDetalleComponent,
    MisVacunasComponent,
    DetalleVacunaComponent,
    MisTurnosComponent,
    DetalleTurnoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlexModule.forRoot({ networkLoading: true }),
    FormsModule,
    HttpClientModule,
    InfiniteScrollModule,
    SharedModule.forRoot(environment.API),
    ReactiveFormsModule,
    MPILibModule
  ],
  providers: [
    Server,
    Auth,
    FormGroupDirective,
    RoutingGuard,
    AdjuntosService,
    PrestacionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
