import { Component, OnInit } from '@angular/core';
import { CommonNovedadesService } from '../../common-novedades.service';
import { INovedad } from '../../../../interfaces/novedades/INovedad.interface';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PlexVisualizadorService } from '@andes/plex';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
})
export class DetalleNovedadComponent implements OnInit {
    novedad: INovedad;
    fotos: any[];

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute,
        private plexVisualizador: PlexVisualizadorService
    ) {
    }

    ngOnInit() {
        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.route.params.subscribe(params => {
                const novedad = params['novedad'];
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
            const apiUri = environment.API;
            return apiUri + '/modules/registro-novedades/store/' + doc.id;
        }
    }

    open(index: number) {
        this.plexVisualizador.open(this.fotos, index);
    }

}
