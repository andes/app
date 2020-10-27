
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BiQueriesComponent } from './components/bi-queries/bi-queries.component';

const routes: Routes = [
    {
        path: 'bi-queries',
        component: BiQueriesComponent
    }
]; @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) export class VisualizacioninfromacionRounting { }
