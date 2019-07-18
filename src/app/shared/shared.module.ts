
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { AgmCoreModule } from '@agm/core';
import { FechaPipe } from './pipes/fecha.pipe';
import { HoraPipe } from './pipes/hora.pipe';
import { EdadPipe } from './pipes/edad.pipe';
import { SexoPipe } from './pipes/sexo.pipe';
import { UploadFileComponent } from './components/upload-file.component';
import { GoogleMapComponent } from './components/google-map.component';


@NgModule({
    declarations: [
        UploadFileComponent,
        GoogleMapComponent,
        FechaPipe,
        HoraPipe,
        EdadPipe,
        SexoPipe
    ],
    imports: [
        PlexModule,
        AuthModule,
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAJuFVuMmVwV8gtP_1m3Ll1VzHagAI_X9I'
        })
    ],
    entryComponents: [
        GoogleMapComponent
    ],
    exports: [
        UploadFileComponent,
        GoogleMapComponent,
        FechaPipe,
        HoraPipe,
        SexoPipe,
        EdadPipe
    ]
})
export class SharedModule { }
