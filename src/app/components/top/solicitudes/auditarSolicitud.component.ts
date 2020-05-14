import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ReglaService } from '../../../services/top/reglas.service';

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
    organizacionesDestino = [];
    tipoPrestacionesDestino = [];
    tipoPrestacionesDestinoData = [];
    profesionalDestino;
    organizacionDestino;
    tipoPrestacionDestino;
    reglasTOP;

    constructor(
        public plex: Plex,
        public adjuntosService: AdjuntosService,
        private servicioReglas: ReglaService,
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
        this.tipoPrestacionDestino = null;
        this.organizacionDestino = null;
        this.profesionalDestino = null;
    }

    aceptar() {
        this.prioridad = null;
        this.showPrioridad = true;
        this.estadoSolicitud = 0;
        this.doShowConfirmar();
    }

    asignar() {
        this.profesional = this.prestacionSeleccionada.solicitud.profesional ? this.prestacionSeleccionada.solicitud.profesional : null;
        this.solicitudAsignada = true;
        this.estadoSolicitud = 1;
        this.doShowConfirmar();
    }

    responder() {
        this.estadoSolicitud = 2;
        this.doShowConfirmar();
    }

    remitir() {
        this.servicioReglas.get({
            organizacionOrigen: this.auth.organizacion.id,
            prestacionOrigen: this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId })
            .subscribe(
                res => {
                    this.reglasTOP = res;
                    this.organizacionesDestino = res.map(elem => ({ id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }));
                }
            );

        this.estadoSolicitud = 3;
        this.doShowConfirmar();
    }

    private doShowConfirmar() {
        this.showConfirmar = true;
        this.corfirmarAuditoria = true;
    }

    confirmar() {
        if (this.corfirmarAuditoria) {
            let data: any = { status: this.estadoSolicitud, observaciones: this.observaciones, prioridad: this.prioridad ? this.prioridad.id : null, profesional: this.profesional};

            if (this.estadoSolicitud === 3) {
                data.organizacion = this.organizacionDestino;
                data.profesional = this.profesionalDestino;
                data.prestacion = this.tipoPrestacionesDestino.find(e => e.conceptId === this.tipoPrestacionDestino.id);
                // verifica si la solicitud es auditable, si no lo es, pasa el estado a pendiente
                if (!this.esRemisionAuditable()) {
                    data.estado = {tipo: 'pendiente' };
                }
            }

            this.returnAuditoria.emit(data);
            this.estadoSolicitud = -1;
            this.showPrioridad = false;
        }
    }

    // Verifica si la regla para ver si la solicitud es auditable
    esRemisionAuditable() {
        let regla = this.reglasTOP.find(rule => rule.destino.prestacion.conceptId === this.tipoPrestacionDestino.id );
        let regla2 = regla.origen.prestaciones.find(rule => rule.prestacion.conceptId === this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId);
        return regla2.auditable;
    }

    cerrar() {
        this.returnAuditoria.emit({ status: true });
    }

    cancelar() {
        this.profesional = null;
        this.estadoSolicitud = -1;
        this.corfirmarAuditoria = false;
        this.showConfirmar = false;
        this.showPrioridad = false;
        this.solicitudAsignada = false;
        this.observaciones = '';
        this.cancelarRemision();
    }

    private cancelarRemision() {
        this.organizacionesDestino = [];
        this.tipoPrestacionesDestino = [];
        this.tipoPrestacionesDestinoData = [];
        this.profesionalDestino = null;
        this.organizacionDestino = null;
        this.tipoPrestacionDestino = null;
        this.reglasTOP = [];
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
        return event.query ? this.servicioProfesional.get({ nombreCompleto: event.query }).subscribe(event.callback) : event.callback([]);
    }

    onSelectOrganizacionDestino() {
        if (this.organizacionDestino) {
            this.servicioReglas.get({
                organizacionOrigen: this.prestacionSeleccionada.solicitud.organizacion.id,
                organizacionDestino: this.organizacionDestino.id,
                prestacionOrigen: this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId
            }).subscribe(res => {
                this.reglasTOP = res;
                this.tipoPrestacionesDestino = res.map(e => e.destino.prestacion);
                this.tipoPrestacionesDestinoData = this.tipoPrestacionesDestino.map(e => ({ id: e.conceptId, nombre: e.term }));
            });
        } else {
            this.tipoPrestacionDestino = null;
            this.tipoPrestacionesDestino = [];
            this.tipoPrestacionesDestinoData = [];
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
