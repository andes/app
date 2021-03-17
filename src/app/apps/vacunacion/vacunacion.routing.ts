import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { InscripcionComponent } from './components/inscripcion.component';
import { ConsultaComponent } from './components/consulta.component';
import { ListadoInscriptosVacunacionComponent } from './components/listado-inscriptos.component';

const routes: Routes = [
    { path: 'inscripcion', component: InscripcionComponent },
    { path: 'inscripcion/:grupo', component: InscripcionComponent },
    { path: 'consulta-inscripcion', component: ConsultaComponent },
    { path: 'listado', component: ListadoInscriptosVacunacionComponent },
    { path: '', redirectTo: 'inscripcion' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class VacunacionRouting { }
