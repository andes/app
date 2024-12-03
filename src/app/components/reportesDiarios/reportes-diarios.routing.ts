import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EncabezadoReportesDiariosComponent } from './encabezadoReportesDiarios.component';

export const REPORTES_ROUTES: Routes = [
    { path: '', component: EncabezadoReportesDiariosComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(REPORTES_ROUTES)],
    providers: []
})
export class ReportesDiariosRouting { }
