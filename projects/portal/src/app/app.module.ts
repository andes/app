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
import { PacienteDetalleComponent } from './components/paciente-detalle.component';
import { RoutingGuard } from './app.routings-guard.class';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { AdjuntosService } from 'src/app/modules/rup/services/adjuntos.service';
import { environment } from '../environments/environment';
import { PDPTituloComponent } from './components/portal-titulo/portal-titulo.component';
import { PDPMenuComponent } from './components/portal-menu/portal-menu.component';
import { PDPMisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PDPMisTurnosDetallesComponent } from './pages/mis-turnos/mis-turnos-detalle.component';
import { PDPMisLaboratoriosComponent } from './pages/mis-laboratorios/mis-laboratorios.component';
import { PDPMisLaboratoriosDetalleComponent } from './pages/mis-laboratorios/mis-laboratorios-detalle.component';
import { PDPMisVacunasComponent } from './pages/mis-vacunas/mis-vacunas.component';
import { PDPDetalleVacunaComponent } from './pages/mis-vacunas/mis-vacunas-detalle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PacienteDetalleComponent,
    PDPMisTurnosComponent,
    PDPMisTurnosDetallesComponent,
    PDPMisLaboratoriosComponent,
    PacienteDetalleComponent,
    PDPMisLaboratoriosDetalleComponent,
    PDPTituloComponent,
    PDPMenuComponent,
    PDPTituloComponent,
    PDPMenuComponent,
    PDPMisVacunasComponent,
    PDPDetalleVacunaComponent
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
    MPILibModule,
    BrowserAnimationsModule
  ],
  providers: [
    Server,
    Auth,
    FormGroupDirective,
    RoutingGuard,
    AdjuntosService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
