import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutingGuard, RoutingNavBar } from 'src/app/app.routings-guard.class';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login-portal-paciente';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';


const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'portal-paciente', component: PortalPacienteComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
