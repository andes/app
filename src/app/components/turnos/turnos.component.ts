import { Component, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { IPaciente } from './../../interfaces/IPaciente';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html'
})

export class TurnosComponent {

    @Input() ag: IAgenda;
    showTurnos: boolean = true;
    numero: String = '';
    smsEnviado: boolean = false;
    smsLoader: boolean = false;
    resultado: any;

    public estadoAsistencia: boolean;

    eventosTurno(agenda: IAgenda, turno: any, event) {
        let btnClicked = event.currentTarget.id;
        let patch: any = {};

        if (btnClicked === 'cancelarTurno') {
            patch = {
                'op': 'cancelarTurno',
                'idTurno': turno.id,
                'estado': 'disponible',
                'paciente': {},
                'prestacion': []
            };
        } else if ((btnClicked === 'darAsistencia') || (btnClicked === 'sacarAsistencia')) {
            if (turno.asistencia) {
                patch = {
                    'op': 'asistenciaTurno',
                    'idTurno': turno.id,
                    'asistencia': false,
                };
            } else {
                patch = {
                    'op': 'asistenciaTurno',
                    'idTurno': turno.id,
                    'asistencia': true,
                };
            }
        }

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.ag = resultado;
        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    enviarSMS(turno: any) {
        this.smsLoader = true;

        for (let x = 0; x < turno.length; x++) {
            if (turno[x].paciente != null) {

                this.smsService.enviarSms(turno[x].paciente.telefono).subscribe(
                    resultado => {
                        this.resultado = resultado;

                        if (resultado === '0') {
                            this.smsLoader = false;
                            this.smsEnviado = true;
                        } else {
                            this.smsLoader = false;
                            this.smsEnviado = false;
                        }
                    },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    });
            }
        }
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService) { }
}
