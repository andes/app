import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login-portal-paciente';
import { PDPMisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PDPMisTurnosDetallesComponent } from './pages/mis-turnos/mis-turnos-detalle.component';

import { PDPMisLaboratoriosComponent } from './pages/mis-laboratorios/mis-laboratorios.component';
import { PDPMisLaboratoriosDetalleComponent } from './pages/mis-laboratorios/mis-laboratorios-detalle.component';
import { RoutingGuard } from './app.routings-guard.class';
import { PDPMisVacunasComponent } from './pages/mis-vacunas/mis-vacunas.component';
import { PDPDetalleVacunaComponent } from './pages/mis-vacunas/mis-vacunas-detalle.component';
import { PDPMisCertificadosComponent } from './pages/mis-certificados/mis-certificados.component';
import { PDPMisCertificadoDetalleComponent } from './pages/mis-certificados/mis-certificados-detalle.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'mis-turnos',
    component: PDPMisTurnosComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisTurnosDetallesComponent }]
  },
  {
    path: 'mis-vacunas',
    component: PDPMisVacunasComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPDetalleVacunaComponent }

    ]
  },
  {
    path: 'mis-laboratorios',
    component: PDPMisLaboratoriosComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisLaboratoriosDetalleComponent }
    ]
  },
  {
    path: 'mis-certificados',
    component: PDPMisCertificadosComponent,
    canActivate: [RoutingGuard],
    children: [
      { path: ':id', component: PDPMisCertificadoDetalleComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
