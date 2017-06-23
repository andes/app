import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../services/turnos/agenda.service';
// import { SmsService } from './../../../../services/turnos/sms.service';

@Component({
    selector: 'reasignar-turno',
    templateUrl: 'reasignar-turno.html'
})

export class ReasignarTurnoComponent implements OnInit {


    @Input() agenda: IAgenda;
    @Input() agendaAReasignar: ITurno;
    @Input() agendasCandidatas: IAgenda[];

    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();
    @Output() cancelaSuspenderTurno = new EventEmitter<boolean>();

    public turnoAReasignar: ITurno;

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    autorizado: any;

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.turnoAReasignar = this.agendaAReasignar;

        let params: any = {
            organizacion: this.auth.organizacion._id
        };

        this.serviceAgenda.get(params).subscribe((agendas) => {
            this.agendasCandidatas = agendas;
        });
    }

    seleccionarTurno(turno) {
        let indice = this.seleccionadosSMS.indexOf(turno);
        if (indice === -1) {
            if (turno.paciente) {
                this.seleccionadosSMS = [...this.seleccionadosSMS, turno];
            }
        } else {
            this.seleccionadosSMS.splice(indice, 1);
            this.seleccionadosSMS = [...this.seleccionadosSMS];
        }
    }

    estaSeleccionado(turno) {
        // console.log('turno.paciente ', turno.paciente);
        if (this.seleccionadosSMS.indexOf(turno) >= 0) {
            return true;
        } else {
            return false;
        }
    }


    reasignarTurno(paciente: any) {
        // this.reasignarTurnoSuspendido.emit(this.turnoAReasignar);
    }

    enviarSMS(turno: any, mensaje) {

    }

    smsEnviado(turno) {

    }

    cancelar() {
        this.cancelaSuspenderTurno.emit(true);
        this.turnoAReasignar = null;
    }

    cerrar() {
        this.saveSuspenderTurno.emit(this.agenda);
    }

}
