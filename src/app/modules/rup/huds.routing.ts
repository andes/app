import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VistaHudsComponent } from './components/ejecucion/vistaHuds.component';
import { RoutingHudsGuard } from '../../app.routings-guard.class';
import { HudsBusquedaPacienteComponent } from './components/ejecucion/hudsBusquedaPaciente.component';

export const HUDS_ROUTES = [
    { path: '', component: HudsBusquedaPacienteComponent, pathMatch: 'full' },
    { path: 'paciente/:id', component: VistaHudsComponent, canActivate: [RoutingHudsGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(HUDS_ROUTES)],
    providers: []
})
export class HUDSRouting { }
