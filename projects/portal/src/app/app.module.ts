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
import { PortalPacienteMainComponent } from './pages/portal-paciente/portal-paciente-main.component';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';
import { RoutingGuard } from './app.routings-guard.class';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { AdjuntosService } from 'src/app/modules/rup/services/adjuntos.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PortalPacienteComponent,
    PacienteDetalleComponent,
    PortalPacienteMainComponent
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
    AdjuntosService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
