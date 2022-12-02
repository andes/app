import { PlexVisualizadorService } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { INovedad } from '../../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../../common-novedades.service';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
})

export class DetalleNovedadComponent implements OnInit {
    public novedad: INovedad;
    public vistaNovedades: INovedad[] = [];
    public fotos: [];

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
                const novedad = params['novedad'];

                if (novedad) {
                    this.novedad = novedades.filter(n => n._id === novedad)[0];
                    this.fotos = this.getFotos(this.novedad);

                    this.agregarVistaNovedad(this.novedad);
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
