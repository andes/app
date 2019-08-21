
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { AgmCoreModule } from '@agm/core';
import { UploadFileComponent } from './components/upload-file.component';
import { GoogleMapComponent } from './components/google-map.component';


@NgModule({
    declarations: [
        UploadFileComponent,
        GoogleMapComponent
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
        GoogleMapComponent
    ],
    exports: [
        UploadFileComponent,
        GoogleMapComponent
    ]
})
export class SharedAppModule { }
