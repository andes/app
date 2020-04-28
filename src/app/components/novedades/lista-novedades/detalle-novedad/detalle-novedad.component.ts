import { Component, OnInit } from '@angular/core';
import { CommonNovedadesService } from '../../common-novedades.service';
import { INovedad } from '../../../../interfaces/novedades/INovedad.interface';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
})
export class DetalleNovedadComponent implements OnInit {
    novedad: INovedad;
    fotos: any[];

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.route.params.subscribe(params => {
                let novedad = params['novedad'];
                if (novedad) {
                    this.novedad = novedades.filter(n => n._id === novedad)[0];
                    this.fotos = this.getFotos(this.novedad);
                } else {
                    this.novedad = novedades[0];
                    this.fotos = this.getFotos(this.novedad);
                }
            });
        });
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
