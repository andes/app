import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GaleriaPipe } from 'src/app/pipes/galeria.pipe';
import { FeatureFlagDirective } from './feature-flag.directive';
import { SelectFinanciadorDirective } from './financiador-select-directive';
import { HoverClassDirective } from './hover-class.directive';
import { SelectOrganizacionDirective } from './organizacion-select.directive';
import { SelectPrestacionesDirective } from './prestaciones-select.directive';
import { SelectProfesionalesDirective } from './profesionales-select.directive';
import { ServicioIntermedioDirective } from './servicio-intermedio.directive';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
    ],
    declarations: [
        SelectFinanciadorDirective,
        HoverClassDirective,
        SelectOrganizacionDirective,
        SelectPrestacionesDirective,
        SelectProfesionalesDirective,
        GaleriaPipe,
        FeatureFlagDirective,
        ServicioIntermedioDirective
    ],
    exports: [
        SelectFinanciadorDirective,
        HoverClassDirective,
        SelectOrganizacionDirective,
        SelectPrestacionesDirective,
        SelectProfesionalesDirective,
        GaleriaPipe,
        FeatureFlagDirective,
        ServicioIntermedioDirective
    ],
})
export class DirectiveLibModule {

}
