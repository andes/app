import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login-portal-paciente';
import { RoutingGuard } from './app.routings-guard.class';
import { PDPMisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PDPMisTurnosDetallesComponent } from './pages/mis-turnos/mis-turnos-detalle.component';

import { PDPMisLaboratoriosComponent } from './pages/mis-laboratorios/mis-laboratorios.component';
import { PDPMisLaboratoriosDetalleComponent } from './pages/mis-laboratorios/mis-laboratorios-detalle.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'mis-turnos',
    component: PDPMisTurnosComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisTurnosDetallesComponent }
    ]
  },
  {
    path: 'mis-laboratorios',
    component: PDPMisLaboratoriosComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisLaboratoriosDetalleComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
