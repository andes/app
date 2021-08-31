import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PantallasComponent } from './views/pantallas.component';
import { PantallaDetalleComponent } from './views/pantalla-detalle.component';

const routes = [
    {
        path: '',
        component: PantallasComponent,
        children: [{
            path: 'edit/:id',
            component: PantallaDetalleComponent
        }, {
            path: 'create',
            component: PantallaDetalleComponent
        }]
    },
    { path: '', redirectTo: 'pantallas', pathMatch: 'full' }
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    // exports: [RouterModule],
    providers: []
})
export class TurneroRouting { }
