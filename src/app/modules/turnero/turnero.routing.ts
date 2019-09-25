import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PantallasComponent } from './views/pantallas.component';
import { PantallaDetalleComponent } from './views/pantalla-detalle.component';

let routes = [
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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class TurneroRouting { }
