import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    idNovedad: string;
    idModulo: string;

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute,
        private router: Router) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idNovedad = params['novedad'];
            this.idModulo = params['modulo'];
            this.initNovedades();
        });
    }

    initNovedades() {
        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
            this.novedades = novedades;
            this.commonNovedadesService.setNovedades(novedades);
            this.idNovedad ? this.buscarNovedad(this.idNovedad, novedades) : this.commonNovedadesService.setNovedades(novedades);
            this.idModulo ? this.filtrarPorModulo(this.idModulo, novedades) : this.commonNovedadesService.setNovedades(novedades);
        });
    }

    filtrarPorModulo(idModulo: string, novedades: INovedad[]) {
        if (novedades.length) {
            const filtro = novedades.filter((novedad: INovedad) => novedad.modulo._id === idModulo);
            this.commonNovedadesService.setNovedades(filtro);
        }
    }

    buscarNovedad(id: string, novedades: INovedad[]) {
        if (novedades.length) {
            this.novedad = novedades.find((novedad: INovedad) => novedad._id === id);
        }
    }

    setNovedad(novedad: INovedad) {
        this.novedad = novedad;
    }

    volver() {
        this.novedad = undefined;
        this.fecha = undefined;
        this.router.navigate(['/novedades']);
        this.initNovedades();
    }
}
