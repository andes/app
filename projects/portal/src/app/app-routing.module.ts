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
import { PDPMisRelacionesComponent } from './pages/mis-relaciones/mis-relaciones.component';
import { PDPMisRelacionesDetalleComponent } from './pages/mis-relaciones/mis-relaciones-detalle.component';
import { DarTurnoComponent } from './components/dar-turno/dar-turno.component';
import { DarTurnoDetalleComponent } from './components/dar-turno-detalle/dar-turno-detalle.component';
import { RegistroCuentaComponent } from './pages/registro-cuenta/registro-cuenta.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { PDPMisDatosPersonalesComponent } from './pages/mis-datos-personales/mis-datos-personales.component';
import { PDPMiInicioComponent } from './pages/mi-inicio/mi-inicio.component';
import { SolicitarCodigoComponent } from './pages/solicitar-codigo/solicitar-codigo.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroCuentaComponent },
    { path: 'mi-inicio', component: PDPMiInicioComponent, canActivate: [RoutingGuard] },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'solicitar-codigo', component: SolicitarCodigoComponent },
    {
        path: 'mis-turnos',
        component: PDPMisTurnosComponent,
        canActivate: [RoutingGuard],
        children: [
            { path: 'dar-turno-detalle/:idAgenda/:idPrestacion', component: DarTurnoDetalleComponent },
            { path: ':id', component: PDPMisTurnosDetallesComponent }
        ]
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
    },
    {
        path: 'mis-relaciones',
        component: PDPMisRelacionesComponent,
        canActivate: [RoutingGuard],
        children: [
            { path: ':id', component: PDPMisRelacionesDetalleComponent }
        ]
    },
    {
        path: 'dar-turnos',
        component: DarTurnoComponent
    },
    {
        path: 'mis-datos-personales',
        component: PDPMisDatosPersonalesComponent,
        canActivate: [RoutingGuard],
        children: [
            { path: ':id', component: PDPMisDatosPersonalesComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
