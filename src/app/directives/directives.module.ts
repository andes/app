import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { SelectFinanciadorDirective } from './financiador-select-directive';
import { HoverClassDirective } from './hover-class.directive';
import { SelectOrganizacionDirective } from './organizacion-select.directive';
import { SelectPrestacionesDirective } from './prestaciones-select.directive';
import { SelectProfesionalesDirective } from './profesionales-select.directive';

import { GaleriaPipe } from 'src/app/pipes/galeria.pipe';
import { FeatureFlagDirective } from './feature-flag.directive';
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
        FeatureFlagDirective
    ],
    exports: [
        SelectFinanciadorDirective,
        HoverClassDirective,
        SelectOrganizacionDirective,
        SelectPrestacionesDirective,
        SelectProfesionalesDirective,
        GaleriaPipe,
        FeatureFlagDirective
    ],
})
export class DirectiveLibModule {

}
