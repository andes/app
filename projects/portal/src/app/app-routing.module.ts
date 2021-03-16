import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login-portal-paciente';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { RoutingGuard } from './app.routings-guard.class';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'portal-paciente', component: PortalPacienteComponent, canActivate: [RoutingGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
