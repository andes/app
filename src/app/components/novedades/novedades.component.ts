import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from './common-novedades.service';

@Component({
    selector: 'novedades',
    templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {
    private novedades = [];
    public filtroFecha = null;

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
                this.novedades = novedades;
                this.commonNovedadesService.setNovedades(novedades);
            });
        });
    }

    public setFiltroFecha(fecha: Date) {
        this.filtroFecha = fecha;

        let filtroNovedades = this.novedades;

        if (fecha) {
            filtroNovedades = this.novedades.filter((novedad: INovedad) => novedad.fecha?.toString() === fecha?.toString());
        }

        this.commonNovedadesService.setNovedades(filtroNovedades);
    }
}
