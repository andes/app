import { NotasComponent } from './components/notas/notas.component';
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
import { FormAutoSaveDirective } from './directives/autosave.directives';
import { PopoverAuditComponent } from './components/popover-audit/popover-audit.component';
import { GaleriaArchivosComponent } from './components/galeria-archivos/galeria-archivos.component';
import { FormsModule } from '@angular/forms';
import { DocumentoPipe } from './pipes/documento.pipe';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';
import { CapitalizeFirstPipe } from './pipes/capitalizeFirst.pipe';
import { FileSize } from './pipes/fileSize.pipe';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule
    ],
    declarations: [
        FechaPipe,
        HoraPipe,
        EdadPipe,
        DocumentoPipe,
        EnumerarPipe,
        FromNowPipe,
        Html2TextPipe,
        NombrePipe,
        PluralizarPipe,
        FormAutoSaveDirective,
        PopoverAuditComponent,
        GaleriaArchivosComponent,
        UploadFileComponent,
        NotasComponent,
        PacienteRestringidoPipe,
        CapitalizeFirstPipe,
        FileSize
    ],
    exports: [
        FechaPipe,
        HoraPipe,
        EdadPipe,
        DocumentoPipe,
        EnumerarPipe,
        FromNowPipe,
        Html2TextPipe,
        NombrePipe,
        PluralizarPipe,
        FormAutoSaveDirective,
        PopoverAuditComponent,
        GaleriaArchivosComponent,
        UploadFileComponent,
        NotasComponent,
        PacienteRestringidoPipe,
        CapitalizeFirstPipe
    ],
    providers: [
        PacienteRestringidoPipe
    ],
})
export class SharedModule {
    static forRoot(host: string): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: [
                Server,
                { provide: APP_HOST, useValue: host }
            ]
        };
    }
}
