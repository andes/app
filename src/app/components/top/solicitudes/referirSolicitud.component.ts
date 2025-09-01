import { Plex } from '@andes/plex';
import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { Auth } from '@andes/auth';
import { ReglaService } from '../../../services/top/reglas.service';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';

@Component({
    selector: 'referir-solicitud',
    templateUrl: './referirSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class ReferirSolicitudComponent implements OnInit {
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;

    prestacionSeleccionada;
    @Input('prestacionSeleccionada')
    set _prestacionSeleccionada(value) {
        this.prestacionSeleccionada = value;
    }
    @Output() returnReferir: EventEmitter<any> = new EventEmitter<any>();
    @Output() returnCitar: EventEmitter<any> = new EventEmitter<any>();
    fileToken: string = null;
    showConfirmar = false;
    prioridad;
    profesional = null;
    confirmarReferir = false;
    observaciones = '';
    organizacionesDestino = [];
    tipoPrestacionesDestino = [];
    tipoPrestacionesDestinoData = [];
    profesionalDestino;
    organizacionDestino;
    tipoPrestacionDestino;
    reglasTOP;
    estadoSolicitud = {
        id: 3,
        nombre: 'Referir'
    };

    constructor(
        public plex: Plex,
        public adjuntosService: AdjuntosService,
        private servicioReglas: ReglaService,
        public servicioProfesional: ProfesionalService,
        public auth: Auth

    ) { }

    ngOnInit() {

        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });

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
        this.doShowConfirmar();
    }

    aceptar() {
        this.prioridad = null;
        this.estadoSolicitud.id = 0;
        this.doShowConfirmar();
    }

    private doShowConfirmar() {
        this.showConfirmar = true;
        this.confirmarReferir = true;
    }

    confirmar() {
        if (this.confirmarReferir) {
            const data: any = { status: 3, observaciones: this.observaciones, prioridad: this.prioridad ? this.prioridad.id : null, profesional: this.profesional };

            data.organizacion = this.organizacionDestino;
            data.profesional = this.profesionalDestino;
            data.prestacion = this.tipoPrestacionesDestino.find(e => e.conceptId === this.tipoPrestacionDestino.id);
            if (!this.esRemisionAuditable()) {
                data.estado = { tipo: 'pendiente' };
            }
            this.plex.toast('success', 'Se refirio correctamente la solicitud');
            this.returnReferir.emit(data);
            this.estadoSolicitud.id = -1;
        }
    }

    esRemisionAuditable() {
        const regla = this.reglasTOP.find(rule => rule.destino.prestacion.conceptId === this.tipoPrestacionDestino.id);
        const regla2 = regla.origen.prestaciones.find(rule => rule.prestacion.conceptId === this.prestacionSeleccionada.solicitud.tipoPrestacionOrigen.conceptId);
        return regla2.auditable;
    }

    cerrar() {
        this.returnReferir.emit({ status: false });
    }

    cancelar() {
        this.profesional = null;
        this.estadoSolicitud.id = -1;
        this.confirmarReferir = false;
        this.showConfirmar = false;
        this.cancelarRemision();
    }

    private cancelarRemision() {
        this.observaciones = '';
        this.profesionalDestino = null;
        this.organizacionDestino = null;
        this.tipoPrestacionDestino = null;
        this.cerrar();
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

    mostrarMotivo() {
        return (this.prestacionSeleccionada.solicitud?.registros?.[0]?.valor?.solicitudPrestacion?.motivo);
    }

}
