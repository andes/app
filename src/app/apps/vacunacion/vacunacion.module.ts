// import { InscripcionVacunasService } from './service/inscripcion-vacunas.service';
// import { VaccinationConsultComponent } from './components/consult/consult.component';
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

@NgModule({
    imports: [CommonModule, FormsModule, HttpClientModule, PlexModule, VacunacionRouting, RecaptchaModule, RecaptchaFormsModule],
    declarations: [InscripcionComponent],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.SITE_KEY,
            } as RecaptchaSettings,
        },
        ProfesionService,
        InscripcionService,
        GrupoPoblacionalService
    ]
})
export class VacunacionModule { }
