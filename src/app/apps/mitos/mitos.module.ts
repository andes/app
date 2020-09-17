import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';

import { SelectExpressionDirective } from './directives/select-expression/select-expression.directive';

import { SnomedService } from './services/snomed.service';
import { Cie10Service } from './services/cie10.service';


@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
    ],
    declarations: [
        SelectExpressionDirective
    ],
    providers: [],
    exports: [
        SelectExpressionDirective
    ]
})
export class MitosModule {
    static forRoot(): ModuleWithProviders<MitosModule> {
        return {
            ngModule: MitosModule,
            providers: [
                SnomedService,
                Cie10Service
            ]
        };
    }
}
