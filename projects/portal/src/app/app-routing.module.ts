import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login-portal-paciente';
import { PortalPacienteComponent } from './pages/portal-paciente/portal-paciente.component';
import { RoutingGuard } from './app.routings-guard.class';
import { PDPMisFamiliaresComponent } from './pages/mis-familiares/mis-familiares.component';
import { PDPMisFamiliaresDetalleComponent } from './pages/mis-familiares/mis-familiares-detalle.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: PortalPacienteComponent, canActivate: [RoutingGuard] },
  {
    path: 'mis-familiares',
    component: PDPMisFamiliaresComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisFamiliaresDetalleComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
