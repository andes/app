import { Component, OnInit, Input } from '@angular/core';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { HUDSService } from '../../services/huds.service';
@Component({
    selector: 'vista-solicitud-top',
    templateUrl: 'vistaSolicitudTop.html',
    styleUrls: ['vistaSolicitudTop.scss'],
})

export class VistaSolicitudTopComponent implements OnInit {
    @Input() registro;
    public normalizedRegistro: any;
    public turno;
    public estado;
    public observaciones = '';

    get isEnviadaTop() {
        return this.registro.inicio === 'top';
    }

    get organizacionDestino() {
        if (!this.isEnviadaTop) {
            return 'Sin definir';
        }
        const registros = this.registro.solicitud?.registros || this.registro.evoluciones;
        return this.registro.solicitud?.organizacion?.nombre || registros?.[0]?.valor?.solicitudPrestacion?.organizacionDestino?.nombre || 'Sin definir';
    }

    public tipoEstado = {
        validada: 'success',
        anulada: 'danger',
        ejecucion: 'default',
        pendiente: 'info',
        auditoria: 'info',
        asignada: 'success',
        rechazada: 'danger',
        vencida: 'danger',
        'turno dado': 'success',
        'contrarreferida': 'warning',
        'registro en huds': 'success'
    };

    constructor(
        public servicioTurnos: TurnoService,
        public huds: HUDSService
    ) { }

    ngOnInit() {
        const lastState = this.registro.estados?.[this.registro.estados.length - 1];

        if (lastState) {
            this.estado = lastState.tipo;
            this.observaciones = lastState.observaciones || lastState.motivoRechazo || '';
        } else {
            // Caso RUP
            this.estado = 'validada';
            const solicitudPrestacion = this.registro.evoluciones?.[0]?.valor?.solicitudPrestacion;
            this.observaciones = solicitudPrestacion?.indicaciones || '';
        }

        const idTurno = this.registro.solicitud?.turno || this.registro.dataPrestacion?.solicitud?.turno;
        if (idTurno) {
            this.servicioTurnos.getTurnos({ id: idTurno }).subscribe(turnos => {
                this.turno = turnos?.[0]?.bloques?.[0]?.turnos?.[0];
            });
        }
    }

    abrirSolicitud() {
        const tipo = 'rup';
        const registroToOpen = this.registro.dataPrestacion || (this.registro.solicitud?.id ? this.registro : { id: this.registro.idPrestacion });
        this.huds.toogle(registroToOpen, tipo);
    }
}
