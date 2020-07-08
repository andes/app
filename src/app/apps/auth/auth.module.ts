import { ModalDisclaimerComponent } from './components/accept-disclaimer/modal-disclaimer.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Module
import { PlexModule } from '@andes/plex';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SelectOrganizacionComponent } from './components/select-organizacion/select-organizacion.component';
import { AuthAppRouting } from './auth.routing';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        AuthAppRouting
    ],
    declarations: [
        LoginComponent,
        LogoutComponent,
        SelectOrganizacionComponent,
        ModalDisclaimerComponent
    ]
})
export class AuthAppModule {
}
