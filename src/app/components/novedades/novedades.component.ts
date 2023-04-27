import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from './common-novedades.service';

@Component({
    selector: 'novedades',
    templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {
    novedades = [];
    novedad;
    fecha: string;
    filtroModulo = false;

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.fecha = params['fecha'];

            this.initNovedades();
        });
    }

    initNovedades() {
        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
            this.novedades = novedades;
            this.commonNovedadesService.setNovedades(novedades);
            this.fecha ? this.filtrarPorFecha(this.fecha, novedades) : this.commonNovedadesService.setNovedades(novedades);
        });
    }

    filtrarPorFecha(fecha: string, novedades: any[]) {
        if (novedades.length) {
            const filtro = novedades.filter((novedad: INovedad) => moment(novedad.fecha).format('YYYY-MM-DD') === fecha);

            if (filtro.length === 1) { this.novedad = filtro[0]; } else {
                this.novedad = null;
                this.commonNovedadesService.setNovedades(filtro);
            }
        }
    }

    setNovedad(novedad: INovedad) {
        this.novedad = novedad;
    }

    setFecha(fecha: Date | null) {
        this.fecha = moment(fecha).format('YYYY-MM-DD');
        this.filtrarPorFecha(this.fecha, this.novedades);
    }

    volver() {
        this.novedad = null;
        this.fecha = null;

        this.initNovedades();
    }
}
