import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ComPuntoInicioComponent } from './components/punto-inicio.component';
import { NuevaDerivacionComponent } from './components/nueva-derivacion/nueva-derivacion.component';

export const COM_ROUTES = [
    { path: '', component: ComPuntoInicioComponent, pathMatch: 'full' },
    { path: ':paciente', component: NuevaDerivacionComponent },
];

@NgModule({
    imports: [RouterModule.forChild(COM_ROUTES)],
    providers: []
})
export class COMRouting { }
