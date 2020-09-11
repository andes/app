
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VisualizacionInformacionComponent } from './components/visualizacion-informacion.component';
import { BiQueriesComponent } from './components/bi-queries/bi-queries.component';

const routes: Routes = [
    {
        path: '',
        component: VisualizacionInformacionComponent
    },
    {
        path: 'bi-queries',
        component: BiQueriesComponent
    }
]; @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) export class VisualizacioninfromacionRounting { }
