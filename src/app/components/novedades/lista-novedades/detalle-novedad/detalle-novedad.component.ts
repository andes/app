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
    fotos: any[];

    constructor(
        public adjuntos: AdjuntosService,
        private commonNovedadesService: CommonNovedadesService) {
    }

    ngOnInit() {
        this.commonNovedadesService.getSelectedNovedad().subscribe((nuevaNovedad) => {
            this.novedad$ = nuevaNovedad;
            this.fotos = this.getFotos(this.novedad$);
        });
    }

    public formatFecha(fecha: string) {
        return moment(fecha).format('DD/mm/YYYY');
    }

    getFotos(novedad: any) {
        if (novedad && novedad.imagenes) {
            return novedad.imagenes.map((doc: any) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return 'http:' + apiUri + '/modules/registro-novedades/store/' + doc.id + '?token=' + this.commonNovedadesService.getToken();
        }
    }

}
