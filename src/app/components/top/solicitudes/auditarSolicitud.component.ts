import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'auditar-solicitud',
    templateUrl: './auditarSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class AuditarSolicitudComponent implements OnInit {
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Audio/Video
        'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
        // Otros
        'dat'
    ];

    prestacionSeleccionada: any;
    @Input('prestacionSeleccionada')
    set _prestacionSeleccionada(value) {
        this.prestacionSeleccionada = value;
        this.resetAuditoria();
    }
    @Input() showCitar: any;
    @Output() returnAuditoria: EventEmitter<any> = new EventEmitter<any>();
    @Output() returnCitar: EventEmitter<any> = new EventEmitter<any>();
    // Adjuntos
    fotos: any[] = [];
    fileToken: String = null;
    lightbox = false;
    indice;
    showConfirmar = false;
    showPrioridad = false;
    prioridad;
    profesional = null;
    profesionales = [];
    prioridades = [
        { id: 'prioritario', nombre: 'PRIORITARIO' }
    ];
    estadoSolicitud = 0;
    corfirmarAuditoria = false;
    solicitudAsignada = false;
    observaciones = '';
    constructor(
        public plex: Plex,
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,
        public servicioProfesional: ProfesionalService,
        public auth: Auth,

    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    resetAuditoria() {
        this.solicitudAsignada = false;
        this.corfirmarAuditoria = false;
        this.showPrioridad = false;
        this.showConfirmar = false;
        this.observaciones = '';
    }

    aceptar() {
        this.prioridad = null;
        this.corfirmarAuditoria = true;
        this.showPrioridad = true;
        this.estadoSolicitud = 1;
        this.showConfirmar = true;
    }

    asignar() {
        this.profesional = this.prestacionSeleccionada.solicitud.profesional ? this.prestacionSeleccionada.solicitud.profesional : null;
        this.corfirmarAuditoria = true;
        this.solicitudAsignada = true;
        this.estadoSolicitud = 2;
        this.showConfirmar = true;
    }

    rechazar() {
        this.corfirmarAuditoria = true;
        this.estadoSolicitud = 3;
        this.showConfirmar = true;
    }

    confirmar() {
        if (this.corfirmarAuditoria) {
            this.returnAuditoria.emit({ status: this.estadoSolicitud, observaciones: this.observaciones, prioridad: this.prioridad ? this.prioridad.id : null, profesional: this.profesional});
            this.showPrioridad = false;
        }
    }

    cerrar() {
        this.returnAuditoria.emit({ status: true });
    }

    cancelar() {
        this.profesional = null;
        this.estadoSolicitud = 0;
        this.corfirmarAuditoria = false;
        this.showConfirmar = false;
        this.showPrioridad = false;
        this.solicitudAsignada = false;
        this.observaciones = '';
    }

    cancelarAceptar() {
        this.showPrioridad = false;
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

    activaLightbox(index) {
        if (this.prestacionSeleccionada.solicitud.registros[0].valor.documentos[index].ext !== 'pdf') {
            this.lightbox = true;
            this.indice = index;
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    imagenPrevia(i) {
        let imagenPrevia = i - 1;
        if (imagenPrevia >= 0) {
            this.indice = imagenPrevia;
        }
    }

    imagenSiguiente(i) {
        let imagenSiguiente = i + 1;
        if (imagenSiguiente <= this.fotos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }

    cancelarCitar() {
        this.returnCitar.emit({ status: true });
    }

    confirmarCitar() {
        this.returnCitar.emit({ status: false, motivo: this.observaciones });
    }

}
