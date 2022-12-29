import { PlexVisualizadorService } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
    styleUrls: ['./detalle-novedad.scss']
})

export class DetalleNovedadComponent implements OnInit {
    public novedad: INovedad;
    public vistaNovedades: INovedad[] = [];
    public fotos: [];
    public fecha = undefined;

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute,
        private plexVisualizador: PlexVisualizadorService
    ) {
    }

    ngOnInit() {
        this.cargarVistaNovedad();

        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.route.params.subscribe(params => {
                const idNovedad = params['novedad'];
                this.fecha = moment(params['fecha']).format('DD/MM/YYYY');

                if (idNovedad) {
                    this.novedad = novedades.filter((novedad: INovedad) => novedad._id === idNovedad)[0];
                    this.fotos = this.getFotos(this.novedad);

                    if (this.novedad) { this.agregarVistaNovedad(this.novedad); }
                }
            });
        });
    }

    cargarVistaNovedad() {
        this.vistaNovedades = JSON.parse(localStorage.getItem('novedades')) || [];
    }

    existeVistaNovedad(novedad?: INovedad) {
        return novedad && this.vistaNovedades.some(elem => elem._id === novedad._id);
    }

    agregarVistaNovedad(novedad: INovedad) {
        if (!this.existeVistaNovedad(novedad)) {
            if (this.vistaNovedades.length === 5) { this.vistaNovedades.shift(); }

            this.vistaNovedades = [...this.vistaNovedades, this.novedad];

            localStorage.setItem('novedades', JSON.stringify(this.vistaNovedades));
        }
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
