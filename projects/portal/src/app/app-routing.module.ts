import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login-portal-paciente';
import { PortalPacienteComponent } from './pages/portal-paciente/portal-paciente.component';
import { RoutingGuard } from './app.routings-guard.class';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: PortalPacienteComponent, canActivate: [RoutingGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
