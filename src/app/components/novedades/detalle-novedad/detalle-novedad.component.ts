import { PlexVisualizadorService } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';

@Component({
    selector: 'detalle-novedad',
    templateUrl: './detalle-novedad.component.html',
    styleUrls: ['./detalle-novedad.scss']
})

export class DetalleNovedadComponent implements OnChanges {
    @Input() novedad: INovedad;
    @Output() volver = new EventEmitter<any>();
    @Output() setFecha = new EventEmitter<any>();

    fotos: string[];
    fecha;

    constructor(
        private plexVisualizador: PlexVisualizadorService
    ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.novedad.currentValue) {
            this.fotos = this.getFotos(changes.novedad.currentValue);
        }
    }

    getFotos(novedad: INovedad) {
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

    volverInicio() {
        this.volver.emit();
    }
}
