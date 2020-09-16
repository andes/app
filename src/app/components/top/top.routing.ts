import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NuevaSolicitudComponent } from './solicitudes/nuevaSolicitud.component';

export const TOP_ROUTES = [
    { path: 'solicitudes/:tipo/:paciente', component: NuevaSolicitudComponent },
];

@NgModule({
    imports: [RouterModule.forChild(TOP_ROUTES)],
    providers: []
})
export class TOPRouting { }
