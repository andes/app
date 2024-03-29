import { MonitoreoInscriptosComponent } from './components/gestion-turnos/monitoreo-inscriptos';
import { DetalleInscripcionComponent } from './components/detalle-inscripcion.component';
import { PlexModule } from '@andes/plex';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { ProfesionService } from 'src/app/services/profesion.service';
import { environment } from '../../../../src/environments/environment';
import { InscripcionComponent } from './components/inscripcion.component';
import { InscripcionService } from './services/inscripcion.service';
import { VacunacionRouting } from './vacunacion.routing';
import { ConsultaComponent } from './components/consulta.component';
import { ListadoInscriptosVacunacionComponent } from './components/listado-inscriptos.component';
import { SharedModule } from '@andes/shared';
import { FiltrosVacunacionComponent } from './components/filtros-vacunacion.component';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { EditarInscripcionComponent } from './components/editar-inscripcion.component';
import { InscripcionBusquedaPacienteComponent } from './components/nueva-inscripcion/busqueda-paciente.component';
import { NuevaInscripcionComponent } from './components/nueva-inscripcion/nueva-inscripcion.component';
import { DirectiveLibModule } from 'src/app/directives/directives.module';
import { LoteComponent } from './components/lote/lote.component';
import { CITASLibModule } from 'src/app/components/turnos/citas.module';
import { LoteEsquemasComponent } from './components/lote/lote-esquemas.component';
import { EstadoPacienteComponent } from './components/estado-paciente/estado-paciente.component';
import { AplicacionesPacienteComponent } from './components/aplicaciones-paciente/aplicaciones-paciente.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PlexModule,
        SharedModule,
        RecaptchaModule,
        MPILibModule,
        VacunacionRouting,
        RecaptchaFormsModule,
        DirectiveLibModule,
        CITASLibModule
    ],
    declarations: [
        InscripcionComponent,
        ConsultaComponent,
        InscripcionComponent,
        ListadoInscriptosVacunacionComponent,
        FiltrosVacunacionComponent,
        EditarInscripcionComponent,
        DetalleInscripcionComponent,
        InscripcionBusquedaPacienteComponent,
        NuevaInscripcionComponent,
        MonitoreoInscriptosComponent,
        LoteComponent,
        LoteEsquemasComponent,
        EstadoPacienteComponent,
        AplicacionesPacienteComponent
    ],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.SITE_KEY,
            } as RecaptchaSettings,
        },
        ProfesionService,
        InscripcionService,
        GrupoPoblacionalService,
    ]
})
export class VacunacionModule { }
