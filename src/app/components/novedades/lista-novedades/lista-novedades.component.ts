import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from './../common-novedades.service';

@Component({
    selector: 'lista-novedades',
    templateUrl: './lista-novedades.component.html',
})

export class ListaNovedadesComponent implements OnInit {
    public novedades = [];
    public cacheNovedades = [];
    public modulo = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commonNovedadesService: CommonNovedadesService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.modulo = params['modulo'];
        });

        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.novedades = novedades;
        });

        this.cacheNovedades = Object.values(JSON.parse(localStorage.getItem('novedades')) || []).reverse();
    }

    verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
