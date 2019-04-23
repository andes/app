import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CitasComponent } from './components/citas/citas.component';
import { HomeComponent } from './components/home.component';
import { RupPacientesComponent } from './components/rup/rup-pacientes.component';
import { TopComponent } from './components/top/top.component';

let routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'citas',
        component: CitasComponent
    },
    {
        path: 'ambulatorio',
        component: RupPacientesComponent
    },
    {
        path: 'top',
        component: TopComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class EstadisticasRouting { }
