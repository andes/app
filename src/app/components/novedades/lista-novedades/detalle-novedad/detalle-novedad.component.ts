import { Component, OnInit } from '@angular/core';
import { CommonNovedadesService } from '../../common-novedades.service';
import { INovedad } from '../../../../interfaces/novedades/INovedad.interface';
import { environment } from '../../../../../environments/environment';
import { AdjuntosService } from '../../../../modules/rup/services/adjuntos.service';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
})
export class DetalleNovedadComponent implements OnInit {
    novedad$: INovedad;

    constructor(
        public adjuntos: AdjuntosService,
        private commonNovedadesService: CommonNovedadesService) {
    }

    ngOnInit() {
        this.commonNovedadesService.getSelectedNovedad().subscribe((nuevaNovedad) => {
            this.novedad$ = nuevaNovedad;
        });
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

}
