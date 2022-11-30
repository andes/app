import { CommonNovedadesService } from './../common-novedades.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';


@Component({
    selector: 'lista-novedades',
    templateUrl: './lista-novedades.component.html',
})
export class ListaNovedadesComponent implements OnInit {
    selectedId: number;
    public novedades$ = [];
    public cacheNovedades = [];
    public modulo;

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
            this.novedades$ = novedades;
        });

        this.cacheNovedades = Object.values(JSON.parse(localStorage.getItem('novedades')) || []).reverse();
    }

    verDetalleNovedad() {
        this.router.navigate(['novedades']);
    }

    public getFoto(novedad: any) {
        const imagenes = novedad.imagenes ? novedad.imagenes : [];
        if (imagenes.length > 0) {
            return this.createUrl(imagenes[0]);
        } else {
            return null;
        }
    }

    createUrl(doc) {
        if (doc.id) {
            const apiUri = environment.API;
            return apiUri + '/modules/registro-novedades/store/' + doc.id;
        }
    }

    public onSelectedNovedadChange(novedad) {
        if (this.modulo) {
            this.router.navigate(['/novedades', this.modulo, 'ver', novedad._id], { relativeTo: this.route });
        } else {
            this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
        }
    }
}
