import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';

@Component({
    selector: 'prestacion-solicitud',
    templateUrl: './prestacionSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class PrestacionSolicitudComponent implements OnInit {
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;

    @Input() prestacionSeleccionada: any;
    @Output() returnPrestacion: EventEmitter<any> = new EventEmitter<any>();
    // Adjuntos
    fotos: any[] = [];
    fileToken: String = null;
    lightbox = false;
    observaciones;
    indice;
    fecha = new Date();
    constructor(
        public plex: Plex,
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,

    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    cancelarPrestacion() {
        this.returnPrestacion.emit({ status: true });
    }

    confirmarPrestacion() {
        this.returnPrestacion.emit({ status: false, fecha: this.fecha, observaciones: this.observaciones });
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    createUrl(doc) {
        /** Hack momentaneo */
        // let jwt = window.sessionStorage.getItem('jwt');
        if (doc.id) {
            const apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }

    activaLightbox(index) {
        if (this.prestacionSeleccionada.solicitud.registros[0].valor.documentos[index].ext !== 'pdf') {
            this.lightbox = true;
            this.indice = index;
        }
    }

    imagenPrevia(i) {
        const imagenPrevia = i - 1;
        if (imagenPrevia >= 0) {
            this.indice = imagenPrevia;
        }
    }

    imagenSiguiente(i) {
        const imagenSiguiente = i + 1;
        if (imagenSiguiente <= this.fotos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }

}
