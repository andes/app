import { NgModule } from '@angular/core';
import { HUDSRouting } from './huds.routing';
import { RUPModule } from './rup.module';

@NgModule({
    imports: [
        HUDSRouting,
        RUPModule
    ],
    declarations: [],
    providers: [],
    exports: [],
})
export class HUDSModule {
}
