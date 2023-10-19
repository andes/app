import { Auth } from '@andes/auth';
import { PlexModule } from '@andes/plex';
import { Server, SharedModule } from '@andes/shared';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScanParser } from 'projects/portal/src/app/providers/scan-parser';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { AdjuntosService } from 'src/app/modules/rup/services/adjuntos.service';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { BarrioService } from '../../../../src/app/services/barrio.service';
import { LocalidadService } from '../../../../src/app/services/localidad.service';
import { ProvinciaService } from '../../../../src/app/services/provincia.service';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoutingGuard } from './app.routings-guard.class';
import { DarTurnoDetalleComponent } from './components/dar-turno-detalle/dar-turno-detalle.component';
import { DarTurnoComponent } from './components/dar-turno/dar-turno.component';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';
import { PDPMenuComponent } from './components/portal-menu/portal-menu.component';
import { PDPTituloComponent } from './components/portal-titulo/portal-titulo.component';
import { LogoPortalPacienteComponent } from './logo-portal-paciente/logo-portal-paciente.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
// Declarations
import { LoginComponent } from './pages/login/login-portal-paciente';
import { PDPMisCertificadoDetalleComponent } from './pages/mis-certificados/mis-certificados-detalle.component';
import { PDPMisCertificadosComponent } from './pages/mis-certificados/mis-certificados.component';
import { PDPMisDatosPersonalesComponent } from './pages/mis-datos-personales/mis-datos-personales.component';
import { PDPMisRelacionesDetalleComponent } from './pages/mis-relaciones/mis-relaciones-detalle.component';
import { PDPMisRelacionesComponent } from './pages/mis-relaciones/mis-relaciones.component';
import { PDPMisLaboratoriosDetalleComponent } from './pages/mis-laboratorios/mis-laboratorios-detalle.component';
import { PDPMisLaboratoriosComponent } from './pages/mis-laboratorios/mis-laboratorios.component';
import { PDPMisTurnosDetallesComponent } from './pages/mis-turnos/mis-turnos-detalle.component';
import { PDPMisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PDPDetalleVacunaComponent } from './pages/mis-vacunas/mis-vacunas-detalle.component';
import { PDPMisVacunasComponent } from './pages/mis-vacunas/mis-vacunas.component';
import { RegistroCuentaComponent } from './pages/registro-cuenta/registro-cuenta.component';
import { CategoriasService } from './services/categoria.service';
import { CertificadoService } from './services/certificado.service';
import { PrestacionService } from './services/prestacion.service';
import { LogPacienteService } from 'src/app/services/logPaciente.service';
import { PDPMiInicioComponent } from './pages/mi-inicio/mi-inicio.component';
import { SolicitarCodigoComponent } from './pages/solicitar-codigo/solicitar-codigo.component';
import { PDPNotificarNecesidadComponent } from './pages/mis-turnos/notificar-necesidad.component';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';
import { RUPLibModule } from 'src/app/modules/rup/rup-lib.module';

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
        PDPMisRelacionesComponent,
        PDPMisRelacionesDetalleComponent,
        PDPTituloComponent,
        PDPMenuComponent,
        PDPMisVacunasComponent,
        PDPDetalleVacunaComponent,
        PDPMisCertificadosComponent,
        PDPMisCertificadoDetalleComponent,
        LogoPortalPacienteComponent,
        DarTurnoComponent,
        DarTurnoDetalleComponent,
        RegistroCuentaComponent,
        ResetPasswordComponent,
        PDPMisDatosPersonalesComponent,
        PDPMiInicioComponent,
        SolicitarCodigoComponent,
        PDPNotificarNecesidadComponent
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
        RecaptchaModule,
        RecaptchaFormsModule,
        RUPLibModule
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
        ScanParser,
        ProvinciaService,
        LocalidadService,
        BarrioService,
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.SITE_KEY,
            } as RecaptchaSettings,
        },
        LogPacienteService,
        ConceptosTurneablesService,
        OrganizacionService,
        ListaEsperaService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
