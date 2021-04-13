import { ListadoPerinatalComponent } from './components/listado-perinatal.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: ListadoPerinatalComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: []
})
export class PerinatalRouting { }
