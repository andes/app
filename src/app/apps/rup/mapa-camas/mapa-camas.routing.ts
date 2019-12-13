import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

let routes = [
    { path: '', redirectTo: 'mapa-camas', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class MapaCamasRouting { }
