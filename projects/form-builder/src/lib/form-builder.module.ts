import { PlexModule } from '@andes/plex';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'projects/shared/src/lib/shared.module';
import { FormBuilderItemComponent } from './form-builder-item/form-builder-item.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';



@NgModule({
    declarations: [
        FormBuilderComponent ,
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
