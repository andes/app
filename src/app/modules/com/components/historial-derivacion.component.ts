import { Input, Component, OnInit } from '@angular/core';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'historial-derivacion',
    templateUrl: './historial-derivacion.html',
    styleUrls: ['./adjuntos.scss']
})
export class HistorialDerivacionComponent {
    public derivacion;
    public itemsHistorial = [];
    public fileToken;
    public adjuntos = [];
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];

    @Input('derivacion')
    set _derivacion(value) {
        this.derivacion = value;
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
        this.cargarItemsHistorial();
    }

    constructor(
        public adjuntosService: COMAdjuntosService
    ) { }

    cargarItemsHistorial() {
        let historial = [...this.derivacion.historial];
        if (!historial) {
            historial = [];
        }
        this.itemsHistorial = historial.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        this.itemsHistorial.forEach(item => {
            this.adjuntos[item.id] = this.documentos(item);
        });
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/com/store/' + doc.id + '?token=' + this.fileToken;
        }
    }

    documentos(estado) {
        let adjuntosEstado = estado.adjuntos;
        if (adjuntosEstado) {
            return adjuntosEstado.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }
}
