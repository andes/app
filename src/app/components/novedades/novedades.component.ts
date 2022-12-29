import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from './common-novedades.service';

@Component({
    selector: 'novedades',
    templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {
    public novedades = [];
    public fecha = undefined;
    public filtroModulo = false;

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private router: Router,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.fecha = params['fecha'] || undefined;

            this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
                this.fecha ? this.filtrarPorFecha(this.fecha, novedades) : this.commonNovedadesService.setNovedades(novedades);
            });
        });
    }

    public filtrarPorFecha(fecha: string, novedades: any[]) {
        if (novedades.length) {
            const filtro = novedades.filter((novedad: INovedad) => moment(novedad.fecha).format('YYYY-MM-DD') === fecha);

            filtro.length === 1 ? this.verDetalleNovedad(filtro[0]) : this.commonNovedadesService.setNovedades(filtro);
        }
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
