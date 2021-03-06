import { UploadFileComponent } from 'src/app/shared/components/upload-file.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';

import { APP_HOST, Server } from './server/server.service';
import { FechaPipe } from './pipes/fecha.pipe';
import { HoraPipe } from './pipes/hora.pipe';
import { EdadPipe } from './pipes/edad.pipe';
import { EnumerarPipe } from './pipes/enumerar.pipe';
import { FromNowPipe } from './pipes/fromNow.pipe';
import { Html2TextPipe } from './pipes/html.pipe';
import { NombrePipe } from './pipes/nombre.pipe';
import { PluralizarPipe } from './pipes/pluralizar.pipe';
import { SexoPipe } from './pipes/sexo.pipe';
import { FormAutoSaveDirective } from './directives/autosave.directives';
import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { GaleriaArchivosComponent } from './components/galeria-archivos/galeria-archivos.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule
    ],
    declarations: [
        FechaPipe,
        HoraPipe,
        EdadPipe,
        EnumerarPipe,
        FromNowPipe,
        Html2TextPipe,
        NombrePipe,
        PluralizarPipe,
        SexoPipe,
        FormAutoSaveDirective,
        PopoverAuditComponent,
        GaleriaArchivosComponent,
        UploadFileComponent
    ],
    exports: [
        FechaPipe,
        HoraPipe,
        EdadPipe,
        EnumerarPipe,
        FromNowPipe,
        Html2TextPipe,
        NombrePipe,
        PluralizarPipe,
        SexoPipe,
        FormAutoSaveDirective,
        PopoverAuditComponent,
        GaleriaArchivosComponent,
        UploadFileComponent
    ]
})
export class SharedModule {
    static forRoot(host: string): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                Server,
                { provide: APP_HOST, useValue: host }
            ]
        };
    }
}
