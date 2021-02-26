// import { InscripcionVacunasService } from './service/inscripcion-vacunas.service';
// import { VaccinationConsultComponent } from './components/consult/consult.component';
import { VacunacionRouting } from './vacunacion.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { RecaptchaModule } from 'ng-recaptcha';
import { InscripcionComponent } from './components/inscripcion.component';
import { ProfesionService } from 'src/app/services/profesion.service';
import { InscripcionService } from './services/inscripcion.service';
// import { ListadoVacunasComponent } from './components/listado-vacunas.component';

@NgModule({
    imports: [CommonModule, FormsModule, HttpClientModule, PlexModule, VacunacionRouting, RecaptchaModule],
    declarations: [InscripcionComponent],
    providers: [
        ProfesionService,
        InscripcionService
    ]
})
export class VacunacionModule { }
