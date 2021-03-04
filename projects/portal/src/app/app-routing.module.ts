import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutingGuard, RoutingNavBar } from 'src/app/app.routings-guard.class';
import { HomeComponent } from './home/home.component';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'portal-paciente', component: PortalPacienteComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
