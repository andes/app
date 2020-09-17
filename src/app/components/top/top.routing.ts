import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NuevaSolicitudComponent } from './solicitudes/nuevaSolicitud.component';
import { SolicitudesComponent } from './solicitudes/solicitudes.component';

export const TOP_ROUTES = [
    { path: 'solicitudes/:tipo/:paciente', component: NuevaSolicitudComponent },
    { path: 'solicitudes', component: SolicitudesComponent },
    { path: 'asignadas', component: SolicitudesComponent},
];

@NgModule({
    imports: [RouterModule.forChild(TOP_ROUTES)],
    providers: []
})
export class TOPRouting { }
