import { PlexModule } from '@andes/plex';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectExpressionDirective } from './directives/select-expression/select-expression.directive';
import { SelectSemanticDirective } from './directives/select-semantic/select-semantic.directive';
import { Cie10Service } from './services/cie10.service';
import { SnomedService } from './services/snomed.service';




@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
    ],
    declarations: [
        SelectExpressionDirective,
        SelectSemanticDirective
    ],
    providers: [],
    exports: [
        SelectExpressionDirective,
        SelectSemanticDirective
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
