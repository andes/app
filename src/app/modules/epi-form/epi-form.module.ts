import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';

import { PlexModule } from '@andes/plex';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { EpiFormsRouting } from './epi-form.routing';
import { FormConfigComponent } from './components/form-config/form-config.component';

import { FormResourcesService } from './services/resources.service';
import { FieldConfigComponent } from './components/field-config/field-config.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { TableConfigComponent } from './components/table-config/table-config.component';
import { DynamicResourcesService } from './services/dynamic-resource.service';


@NgModule({
    declarations: [
        FormsListComponent,
        FormConfigComponent,
        FieldConfigComponent,
        TableConfigComponent
    ],
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        DragDropModule,
        EpiFormsRouting
    ],
    providers: [
        FormResourcesService,
        DynamicResourcesService,
    ],
    exports: []
})
export class EpiFormModule {}
