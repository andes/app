import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlexModule } from '@andes/plex';

import { UploadFileComponent } from './components/upload-file.component';
import { PacienteRestringidoPipe } from '../pipes/pacienteRestringido.pipe';

@NgModule({
    imports: [
        CommonModule,
        PlexModule
    ],
    declarations: [
        UploadFileComponent,
        PacienteRestringidoPipe
    ],
    exports: [
        UploadFileComponent,
        PacienteRestringidoPipe
    ],
    providers: [
        PacienteRestringidoPipe
    ]
})
export class AndesAppSharedModule { }
