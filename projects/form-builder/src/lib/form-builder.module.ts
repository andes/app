import { FormBuilderComponent } from './form-builder/form-builder.component';
import { FormBuilderItemComponent } from './form-builder-item/form-builder-item.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'projects/shared/src/lib/shared.module';



@NgModule({
    declarations: [
        FormBuilderComponent,
        FormBuilderItemComponent
    ],
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        SharedModule
    ],
    exports: [FormBuilderComponent]
})
export class FormBuilderModule { }
