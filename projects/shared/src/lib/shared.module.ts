import { NgModule, ModuleWithProviders } from '@angular/core';
import { Server } from './server/server.service';
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

@NgModule({
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
        FormAutoSaveDirective
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
        FormAutoSaveDirective
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                Server
            ]
        };
    }
}
