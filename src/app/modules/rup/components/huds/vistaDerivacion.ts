import { Component, OnInit, Input } from '@angular/core';
import { Auth } from '@andes/auth';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { HUDSService } from '../../services/huds.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { AdjuntosService } from '../../services/adjuntos.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
@Component({
    selector: 'vista-derivacion',
    templateUrl: 'vistaDerivacion.html',
    styleUrls: ['vistaDerivacion.scss'],
})

export class VistaDerivacionComponent implements OnInit {

    @Input() registro;
    turno;
    estado;
    observaciones = '';
    organizacionOrigen;
    public puedeDescargarInforme: boolean;
    public requestInProgress: boolean;
    public adjuntosUrl = [];
    fileToken: string = null;
    historialDerivaciones = [];

    constructor(
        public servicioTurnos: TurnoService,
        public huds: HUDSService,
        private auth: Auth,
        private documentosService: DocumentosService,
        private adjuntosService: AdjuntosService,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.puedeDescargarInforme = this.auth.check('huds:impresion');
        this.adjuntosUrl = this.registro.adjuntos.map((doc) => {
            return {
                ...doc,
                url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
            };
        });
        this.organizacionOrigen = this.organizacionService.getById(this.registro.organizacionOrigen.id).subscribe(organizacion => {
            this.organizacionOrigen = organizacion;

            this.historialDerivaciones = this.getHistorialDerivacion(this.organizacionOrigen, this.registro);
        });

    }

    abrirSolicitud() {
        const tipo = 'rup';
        this.huds.toogle(this.registro, tipo);
    }

    imprimirHistorial() {
        this.requestInProgress = true;
        const foo = () => this.requestInProgress = false;
        this.documentosService.descargarHistorialDerivacion(this.registro._id, this.registro.paciente.apellido).subscribe(foo, foo);
    }

    getHistorialDerivacion2() {
        this.registro.historial.shift();
        const organizacion = this.registro.organizacionOrigen;
        let historial = organizacion.esCOM ? this.registro.historial : this.registro.historial.filter((h) => h.createdBy.organizacion.id === organizacion.id);
        historial = historial.filter(h => !h.eliminado);
        historial.forEach(h => {
            h.fechaCreacion = moment(h.createdAt).locale('es').format('DD/MM/YYYY HH:mm');
            h.reporteCOM = organizacion.esCOM;
            h.esActualizacion = !h?.estado;
        });
        return historial.sort((a, b) => b.createdAt - a.createdAt);
    }

    getHistorialDerivacion(organizacion, derivacion) {
        derivacion.historial.shift();
        let historial = organizacion.esCOM ? derivacion.historial : derivacion.historial.filter((h) => h.createdBy.organizacion.id === organizacion.id);
        historial = historial.filter(h => !h.eliminado);
        historial.forEach(h => {
            h.fechaCreacion = moment(h.createdAt).locale('es').format('DD/MM/YYYY HH:mm');
            h.reporteCOM = organizacion.esCOM;
            h.esActualizacion = !h?.estado;
        });
        return historial.sort((a, b) => b.createdAt - a.createdAt);
    }
}
