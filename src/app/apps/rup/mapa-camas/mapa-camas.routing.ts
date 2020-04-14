import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapaCamasCapaComponent } from './views/mapa-camas-capa/mapa-camas-capa.component';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { CamaMainComponent } from './views/cama/cama.component';
import { CensosDiariosComponent } from './views/censos/censo-diario/censo-diario.component';
import { CensosMensualesComponent } from './views/censos/censo-mensual/censo-mensual.component';
import { InternacionListadoComponent } from './views/listado-internacion/listado-internacion.component';
import { InternacionListaEsperaComponent } from './views/lista-espera/lista-espera.component';

const routes = [
    { path: 'mapa-camas', component: MapaCamasMainComponent },

    { path: 'mapa-camas/:capa', component: MapaCamasCapaComponent },

    { path: 'cama/:id', component: CamaMainComponent },

    { path: 'cama', component: CamaMainComponent },

    { path: 'censo/diario', component: CensosDiariosComponent },

    { path: 'censo/mensual', component: CensosMensualesComponent },

    { path: 'listado-internacion', component: InternacionListadoComponent },

    { path: ':ambito/:capa/lista-espera', component: InternacionListaEsperaComponent },

    { path: '', redirectTo: 'mapa-camas', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class MapaCamasRouting { }
