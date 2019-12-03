import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { MapaCamasCapaComponent } from './mapa-camas-capa/mapa-camas-capa.component';
import { CensoDiarioComponent } from './censo-diario/censo-diario.component';

let routes = [
    {
        path: 'mapa-camas/:capa',
        component: MapaCamasCapaComponent,
    },
    {
        path: 'mapa-camas',
        component: MapaCamasMainComponent,
    },
    {
        path: 'censo/diario',
        component: CensoDiarioComponent,
    },
    { path: '', redirectTo: 'mapa-camas', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class MapaCamasRouting { }
