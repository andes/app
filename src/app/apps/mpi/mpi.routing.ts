import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PacienteBuscadorComponent } from './pacientes/views/paciente-buscador.component';
import { PacienteCruComponent } from './pacientes/views/paciente-cru.component';

const routes = [
    {
        path: 'lista',
        component: PacienteBuscadorComponent
    },
    {
        path: 'paciente/:opcion',
        component: PacienteCruComponent
    },
    {
        path: 'paciente',
        component: PacienteCruComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class MPIRouting { }
