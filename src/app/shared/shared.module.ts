import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { AgmCoreModule } from '@agm/core';
import { UploadFileComponent } from './components/upload-file.component';
import { GeoreferenciaService } from '../../app/apps/mpi/pacientes/services/georeferencia.service';


@NgModule({
    declarations: [
        UploadFileComponent,
        GeoreferenciaService
    ],
    imports: [
        PlexModule,
        AuthModule,
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: ''
        })
    ],
    entryComponents: [
        GeoreferenciaService
    ],
    exports: [
        UploadFileComponent,
        GeoreferenciaService
    ]
})
export class SharedAppModule { }
