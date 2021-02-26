// import { VacunacionConsultComponent } from './components/consult/consult.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { InscripcionComponent } from './components/inscripcion.component';
// import { ListadoVacunasComponent } from './components/listado.component';

const routes: Routes = [
    // { path: 'consulta', component: VacunacionConsultaComponent },
    { path: 'inscripcion', component: InscripcionComponent },
    // { path: 'listado', component: ListadoVacunasComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class VacunacionRouting { }
