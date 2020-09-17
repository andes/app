import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PuntoInicioComponent } from './components/ejecucion/puntoInicio.component';
import { PrestacionCrearComponent } from './components/ejecucion/prestacionCrear.component';
import { PrestacionEjecucionComponent } from './components/ejecucion/prestacionEjecucion.component';
import { PrestacionValidacionComponent } from './components/ejecucion/prestacionValidacion.component';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { RoutingHudsGuard } from '../../app.routings-guard.class';
import { HudsBusquedaPacienteComponent } from './components/ejecucion/hudsBusquedaPaciente.component';
import { PlantillasRUPComponent } from '../../apps/rup/plantillas-rup/plantillas-rup.component';

export const RUP_ROUTES = [
    { path: '', component: PuntoInicioComponent, pathMatch: 'full' },
    { path: 'crear/:opcion', component: PrestacionCrearComponent },
    { path: 'ejecucion/:id', component: PrestacionEjecucionComponent },
    { path: 'validacion/:id', component: PrestacionValidacionComponent },
    { path: 'vista/:id', component: VistaHudsComponent, canActivate: [RoutingHudsGuard] },
    { path: 'huds/paciente/:id', component: VistaHudsComponent, canActivate: [RoutingHudsGuard] },
    { path: 'huds', component: HudsBusquedaPacienteComponent },
    { path: 'plantillas', component: PlantillasRUPComponent }
];

@NgModule({
    imports: [RouterModule.forChild(RUP_ROUTES)],
    providers: []
})
export class RUPRouting { }
