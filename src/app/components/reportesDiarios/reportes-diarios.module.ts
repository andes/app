import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { ExcelService } from '../../services/xlsx.service';
import { EncabezadoReportesDiariosComponent } from './encabezadoReportesDiarios.component';
import { PlanillaC1Component } from './planillaC1.component';
import { ResumenDiarioMensualComponent } from './resumenDiarioMensual.component';
import { ReportesDiariosRouting } from './reportes-diarios.routing';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        ReportesDiariosRouting
    ],
    declarations: [
        EncabezadoReportesDiariosComponent,
        PlanillaC1Component,
        ResumenDiarioMensualComponent
    ],
    providers: [
        ExcelService
    ],
    exports: [],
})
export class ReportesDiariosModule {

}
