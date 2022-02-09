import { MonitoreoInscriptosComponent } from './components/gestion-turnos/monitoreo-inscriptos';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { InscripcionComponent } from './components/inscripcion.component';
import { ConsultaComponent } from './components/consulta.component';
import { ListadoInscriptosVacunacionComponent } from './components/listado-inscriptos.component';
import { RoutingNavBar, RoutingGuard } from 'src/app/app.routings-guard.class';
import { NuevaInscripcionComponent } from './components/nueva-inscripcion/nueva-inscripcion.component';
import { LoteComponent } from './components/lote/lote.component';
import { EstadoPacienteComponent } from './components/estado-paciente/estado-paciente.component';

const routes: Routes = [
    { path: 'inscripcion', component: InscripcionComponent },
    { path: 'inscripcion/:grupo', component: InscripcionComponent },
    { path: 'consulta-inscripcion', component: ConsultaComponent },
    { path: 'monitoreo', component: MonitoreoInscriptosComponent },
    { path: 'lote', component: LoteComponent },
    { path: 'listado', component: ListadoInscriptosVacunacionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'nueva/:paciente', component: NuevaInscripcionComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: 'estado', component: EstadoPacienteComponent, canActivate: [RoutingNavBar, RoutingGuard] },
    { path: '', redirectTo: 'inscripcion' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class VacunacionRouting { }
