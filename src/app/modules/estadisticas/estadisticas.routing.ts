import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CitasComponent } from './components/citas/citas.component';
import { HomeComponent } from './components/home.component';
import { RupPacientesComponent } from './components/rup/rup-pacientes.component';

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
        path: 'rup',
        component: RupPacientesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class EstadisticasRouting { }
