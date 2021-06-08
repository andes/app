import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Auth } from '@andes/auth';
import { BrowserModule } from '@angular/platform-browser';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppRoutingModule } from './app-routing.module';
import { PlexModule } from '@andes/plex';
import { Server, SharedModule } from '@andes/shared';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';

// Declarations
import { LoginComponent } from './pages/login/login-portal-paciente';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';
import { RoutingGuard } from './app.routings-guard.class';
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
import { PDPMisCertificadosComponent } from './pages/mis-certificados/mis-certificados.component';
import { PDPMisCertificadoDetalleComponent } from './pages/mis-certificados/mis-certificados-detalle.component';
import { CertificadoService } from './services/certificado.service';
import { CategoriasService } from './services/categoria.service';
import { PrestacionService } from './services/prestacion.service';
import { PDPMisFamiliaresComponent } from './pages/mis-familiares/mis-familiares.component';
import { PDPMisFamiliaresDetalleComponent } from './pages/mis-familiares/mis-familiares-detalle.component';
import { LogoPortalPacienteComponent } from './logo-portal-paciente/logo-portal-paciente.component';
import { DarTurnoComponent } from './components/dar-turno/dar-turno.component';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { DarTurnoDetalleComponent } from './components/dar-turno-detalle/dar-turno-detalle.component';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { RegistroCuentaComponent } from './pages/registro-cuenta/registro-cuenta.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanParser } from 'projects/portal/src/app/providers/scan-parser';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

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
    PDPMisFamiliaresComponent,
    PDPMisFamiliaresDetalleComponent,
    PDPTituloComponent,
    PDPMenuComponent,
    PDPMisVacunasComponent,
    PDPDetalleVacunaComponent,
    PDPMisCertificadosComponent,
    PDPMisCertificadoDetalleComponent,
    LogoPortalPacienteComponent,
    DarTurnoComponent,
    DarTurnoDetalleComponent,
    RegistroCuentaComponent
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
    BrowserAnimationsModule,
    ZXingScannerModule,
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  providers: [
    Server,
    Auth,
    FormGroupDirective,
    RoutingGuard,
    AdjuntosService,
    CertificadoService,
    CategoriasService,
    PrestacionService,
    PacienteService,
    AgendaService,
    TurnoService,
    ScanParser
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
