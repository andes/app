import { CommonNovedadesService } from './../common-novedades.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';


@Component({
    selector: 'lista-novedades',
    templateUrl: './lista-novedades.component.html',
})
export class ListaNovedadesComponent implements OnInit {
    selectedId: number;
    public novedades$ = [];

    constructor(
        private router: Router,
        private commonNovedadesService: CommonNovedadesService
    ) {
    }

    ngOnInit() {
        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.novedades$ = novedades;
        });
    }

    verDetalleNovedad() {
        this.router.navigate(['novedades']);
    }

    public formatFecha(fecha: string) {
        return moment(fecha).format('DD/mm/YYYY');
    }

    public getFoto(novedad: any) {
        let imagenes = novedad.imagenes ? novedad.imagenes : [];
        if (imagenes.length > 0) {
            return this.createUrl(imagenes[0]);
        } else {
            return null;
        }
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return 'http:' + apiUri + '/modules/registro-novedades/store/' + doc.id + '?token=' + this.commonNovedadesService.getToken();
        }
    }

    public onSelectedNovedadChange(novedad) {
        this.commonNovedadesService.setSelectedNovedad(novedad);
    }

}
