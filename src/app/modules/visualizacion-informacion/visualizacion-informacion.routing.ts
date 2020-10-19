
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BiQueriesComponent } from './components/bi-queries/bi-queries.component';
import { ExportarHudsComponent } from './components/exportar-huds/exportar-huds.component';

const routes: Routes = [
    {
        path: 'bi-queries',
        component: BiQueriesComponent
    },
    {
        path: 'exportar-huds',
        component: ExportarHudsComponent
    }
]; @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) export class VisualizacioninfromacionRounting { }
