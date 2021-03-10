// import { VacunacionConsultComponent } from './components/consult/consult.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { InscripcionComponent } from './components/inscripcion.component';

const routes: Routes = [
    { path: 'inscripcion', component: InscripcionComponent },
    { path: 'inscripcion/:grupo', component: InscripcionComponent },
    { path: '', redirectTo: 'inscripcion' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class VacunacionRouting { }
