import { Component, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';

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

    listaEspera: any;

    public estadoAsistencia: boolean;
    public pacientesSeleccionados: any[] = [];

    agregarPaciente(paciente) {
        if (this.pacientesSeleccionados.find(x => x === paciente)) {
            this.pacientesSeleccionados.splice(this.pacientesSeleccionados.indexOf(paciente), 1)
        }
        else {
            this.pacientesSeleccionados.push(paciente);
        }
    }

    eventosTurno(agenda: IAgenda, turno: any, event) {
        let btnClicked = event.currentTarget.id;
        let patch: any = {};
debugger;
        if (btnClicked === 'cancelarTurno') {
            patch = {
                'op': 'cancelarTurno',
                'idTurno': turno.id
            };
        } else if ((btnClicked === 'darAsistencia') || (btnClicked === 'sacarAsistencia')) {
            patch = {
                'op': 'asistenciaTurno',
                'idTurno': turno.id
            };
        } else if (btnClicked === 'bloquearTurno') {
            patch = {
                'op': 'bloquearTurno',
                'idTurno': turno.id
            };
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

    agregarPacienteListaEspera(agenda: any) {
        debugger;
        let patch: any = {};

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': agenda.id,
            'pacientes': this.pacientesSeleccionados
        };

        this.listaEsperaService.patch(agenda.id, patch).subscribe(resultado => agenda = resultado);
    }

    enviarSMS() {
        this.smsLoader = true;

        for (let x = 0; x < this.pacientesSeleccionados.length; x++) {
            if (this.pacientesSeleccionados[x].paciente != null) {

                this.smsService.enviarSms(this.pacientesSeleccionados[x].paciente.telefono).subscribe(
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
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
