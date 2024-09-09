import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';

import { PlexModule } from '@andes/plex';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { EpiFormsRouting } from './epi-form.routing';
import { FormConfigComponent } from './components/form-config/form-config.component';


@NgModule({
    declarations: [
        FormsListComponent,
        FormConfigComponent
    ],
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        ScrollingModule,
        EpiFormsRouting
    ],
    providers: [],
    exports: []
})
export class EpiFormModule {}
