import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { FILE_EXT, IMAGENES_EXT } from '@andes/shared';

@Component({
    selector: 'anular-solicitud',
    templateUrl: './anularSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class AnularSolicitudComponent implements OnInit {
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;

    @Input() prestacionSeleccionada: any;
    @Input() tipoSolicitud: string;
    @Output() returnAnular: EventEmitter<any> = new EventEmitter<any>();
    // Adjuntos
    fotos: any[] = [];
    fileToken: String = null;
    showConfirmar = false;
    motivo = '';
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

    aceptar() {
        this.returnAnular.emit({ status: true });
    }

    rechazar() {
        this.showConfirmar = true;
    }

    cancelarAnular() {
        this.returnAnular.emit({ status: true });
    }

    confirmarAnular() {
        if (this.motivo) {
            this.returnAnular.emit({ status: false, motivo: this.motivo });
            this.showConfirmar = false;
        } else {
            this.plex.info('danger', 'Debe ingresar el motivo de anulación');
        }
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    createUrl(doc) {
        /** Hack momentaneo */
        // let jwt = window.sessionStorage.getItem('jwt');
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }

    get documentos() {
        let solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
        if (solicitudRegistros.some(reg => reg.valor.documentos)) {
            return solicitudRegistros[0].valor.documentos.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }

}
