
// Module
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@andes/shared';
import { SharedAppModule } from '../../../app/shared/shared.module';

import { ActivarAppComponent } from './components/activar-app.component';
import { AppMobileService } from './services/appMobile.service';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        AuthModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
        SharedAppModule,
        SharedModule
    ],
    declarations: [
        ActivarAppComponent
    ],
    exports: [
        ActivarAppComponent
    ]
})
export class MobileModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: MobileModule,
            providers: [
                AppMobileService
            ]
        };
    }
}



