import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SelectOrganizacionComponent } from './components/select-organizacion/select-organizacion.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { RecoveryComponent } from './components/recovery/recovery.component';
import { RoutingNavBar, RoutingGuard } from '../../app.routings-guard.class';

let routes = [
    { path: 'select-organizacion', component: SelectOrganizacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'login', component: LoginComponent, canActivate: [RoutingNavBar] },
    { path: 'forgot', component: ForgotComponent, canActivate: [RoutingNavBar] },
    { path: 'resetPassword/:token', component: RecoveryComponent, canActivate: [RoutingNavBar] },
    { path: 'logout', component: LogoutComponent, canActivate: [RoutingNavBar, RoutingGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class AuthAppRouting { }
