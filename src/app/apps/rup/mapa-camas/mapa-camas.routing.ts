import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MapaCamasCapaComponent } from './views/mapa-camas-capa/mapa-camas-capa.component';
import { MapaRecursosComponent } from './views/mapa-camas-capa/mapa-recursos.component';
import { MapaCamasMainComponent } from './mapa-camas-main.component';
import { CamaMainComponent } from './views/cama/cama.component';
import { CensosDiariosComponent } from './views/censos/censo-diario/censo-diario.component';
import { CensosMensualesComponent } from './views/censos/censo-mensual/censo-mensual.component';
import { InternacionListadoComponent } from './views/listado-internacion/listado-internacion.component';
import { InternacionListaEsperaComponent } from './views/lista-espera/lista-espera.component';
import { SalaComunComponent } from './views/sala-comun/sala-comun.component';
import { ListadoInternacionCapasComponent } from './views/listado-internacion-capas/listado-internacion-capas.component';

export const INTERNACION_ROUTES = [

    { path: ':ambito/cama/:id', component: CamaMainComponent },

    { path: ':ambito/cama', component: CamaMainComponent },

    { path: ':ambito/censo/diario', component: CensosDiariosComponent },

    { path: ':ambito/censo/mensual', component: CensosMensualesComponent },

    { path: ':ambito/:capa/lista-espera', component: InternacionListaEsperaComponent },

    { path: ':ambito/sala-comun', component: SalaComunComponent },

    { path: ':ambito/sala-comun/:id', component: SalaComunComponent },

    { path: 'listado-internacion', component: InternacionListadoComponent },

    { path: 'listado-internacion-medico', component: ListadoInternacionCapasComponent },

    { path: 'mapa-recursos', component: MapaRecursosComponent },

    { path: ':ambito', component: MapaCamasMainComponent },

    { path: ':ambito/:capa', component: MapaCamasCapaComponent },



    { path: '', redirectTo: 'internacion', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(INTERNACION_ROUTES)],
    providers: []
})
export class MapaCamasRouting { }
