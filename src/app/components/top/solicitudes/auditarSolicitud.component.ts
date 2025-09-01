import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ReglaService } from '../../../services/top/reglas.service';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';
import { PlexVisualizadorService } from '@andes/plex';

@Component({
    selector: 'auditar-solicitud',
    templateUrl: './auditarSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class AuditarSolicitudComponent implements OnInit {
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;

    prestacionSeleccionada: any;
    @Input('prestacionSeleccionada')
    set _prestacionSeleccionada(value) {
        this.prestacionSeleccionada = value;
        this.resetAuditoria();
    }
    @Output() returnAuditoria: EventEmitter<any> = new EventEmitter<any>();
    // Adjuntos
    fotos: any[] = [];
    fileToken: string = null;
    showConfirmar = false;
    showPrioridad = false;
    prioridad;
    profesional = null;
    profesionales = [];
    prioridades = [
        { id: 'prioritario', nombre: 'PRIORITARIO' }
    ];
    estadoSolicitud = {
        id: 0,
        nombre: ''
    };
    confirmarAuditoria = false;
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
        private plexVisualizador: PlexVisualizadorService

    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    resetAuditoria() {
        this.solicitudAsignada = false;
        this.confirmarAuditoria = false;
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
        this.estadoSolicitud.id = 0;
        this.estadoSolicitud.nombre = 'Aceptar';
        this.doShowConfirmar();
    }

    asignar() {
        this.profesional = this.prestacionSeleccionada.solicitud.profesional ? this.prestacionSeleccionada.solicitud.profesional : null;
        this.solicitudAsignada = true;
        this.estadoSolicitud.id = 1;
        this.estadoSolicitud.nombre = 'Asignar';
        this.doShowConfirmar();
    }

    responder() {
        this.servicioReglas.get({
            organizacionOrigen: this.auth.organizacion.id,
            prestacionOrigen: this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId
        })
            .subscribe(
                res => {
                    this.reglasTOP = res;
                    this.organizacionesDestino = res.map(elem => ({ id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }));
                }
            );
        this.estadoSolicitud.id = 2;
        this.estadoSolicitud.nombre = 'Responder';
        this.doShowConfirmar();
    }

    referir() {
        this.servicioReglas.get({
            organizacionOrigen: this.auth.organizacion.id,
            prestacionOrigen: this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId
        })
            .subscribe(
                res => {
                    this.reglasTOP = res;
                    this.organizacionesDestino = res.map(elem => ({ id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }));
                }
            );

        this.estadoSolicitud.id = 3;
        this.estadoSolicitud.nombre = 'Referir';
        this.doShowConfirmar();
    }

    referirAuditar(event) {
        if (event) {
            if (event.status) {
                this.returnAuditoria.emit(event);
            } else {
                this.estadoSolicitud.id = -1;
            }

            this.showConfirmar = false;
            this.confirmarAuditoria = false;
        }
        if (!event) {
            this.estadoSolicitud.id = 3;
            this.estadoSolicitud.nombre = 'Referir';
            this.doShowConfirmar();
        }
    }

    private doShowConfirmar() {
        this.showConfirmar = true;
        this.confirmarAuditoria = true;
    }

    confirmar() {
        if (this.confirmarAuditoria) {
            const data: any = { status: this.estadoSolicitud.id, observaciones: this.observaciones, prioridad: this.prioridad ? this.prioridad.id : null, profesional: this.profesional };

            if (this.estadoSolicitud.id === 3) {
                data.organizacion = this.organizacionDestino;
                data.profesional = this.profesionalDestino;
                data.prestacion = this.tipoPrestacionDestino;
                // verifica si la solicitud es auditable, si no lo es, pasa el estado a pendiente
                if (!this.esRemisionAuditable()) {
                    data.estado = { tipo: 'pendiente' };
                }
            }

            if (this.estadoSolicitud.id === 2) {
                data.organizacionContrarreferida = this.prestacionSeleccionada.solicitud.historial[this.prestacionSeleccionada.solicitud?.historial?.length - 1].organizacion;
            }

            this.returnAuditoria.emit(data);
            this.estadoSolicitud.id = -1;
            this.estadoSolicitud.nombre = 'Confirmar';
            this.showPrioridad = false;
        }
    }

    // Verifica si la regla para ver si la solicitud es auditable
    esRemisionAuditable() {
        const regla = this.reglasTOP.find(rule => rule.destino.prestacion.conceptId === this.tipoPrestacionDestino.id);
        const regla2 = regla.origen.prestaciones.find(rule => rule.prestacion.conceptId === this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId);
        return regla2.auditable;
    }

    cancelar() {
        this.profesional = null;
        this.estadoSolicitud.id = -1;
        this.estadoSolicitud.nombre = '';
        this.confirmarAuditoria = false;
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
        if (doc.id) {
            const apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
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

    get documentos() {
        const solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
        if (solicitudRegistros.some(reg => reg.valor.documentos)) {
            return solicitudRegistros[0].valor.documentos.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }

    open(index: number) {
        this.plexVisualizador.open(this.documentos, index);
    }
}
