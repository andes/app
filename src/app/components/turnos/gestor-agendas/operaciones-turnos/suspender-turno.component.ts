import { environment } from './../../../../../environments/environment';
import * as moment from 'moment';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../../../services/turnos/listaEspera.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { SmsService } from './../../../../services/turnos/sms.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'suspender-turno',
    templateUrl: 'suspender-turno.html'
})

export class SuspenderTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() turnosSeleccionados: ITurno[];

    @Input() accion: any;

    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();
    @Output() cancelaSuspenderTurno = new EventEmitter<boolean>();

    turnos: any = [];
    showSuspenderTurno: Boolean = true;
    resultado: any;

    public reasignar: any = {};

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;

    constructor(public plex: Plex, public auth: Auth, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService, public smsService: SmsService) { }

    ngOnInit() {

        if (this.turnosSeleccionados.length < 0) {
            return;
        }

        this.turnos = this.turnosSeleccionados;

        this.motivoSuspension = [
            {
                id: 1,
                nombre: 'edilicia'
            }, {
                id: 2,
                nombre: 'profesional'
            },
            {
                id: 3,
                nombre: 'organizacion'
            }
        ];

        this.motivoSuspensionSelect.select = this.motivoSuspension[1];
    }


    seleccionarTurno(turno) {
        const indice = this.seleccionadosSMS.indexOf(turno);
        if (indice === -1) {
            if (turno.paciente && turno.paciente.id) {
                this.seleccionadosSMS = [...this.seleccionadosSMS, turno];
            }
        } else {
            this.seleccionadosSMS.splice(indice, 1);
            this.seleccionadosSMS = [...this.seleccionadosSMS];
        }
    }

    estaSeleccionado(turno) {
        if (this.seleccionadosSMS.indexOf(turno) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    tienePaciente(turno) {
        return turno.paciente != null && turno.paciente.id != null;
    }

    suspenderTurno() {

        if (this.motivoSuspensionSelect.select.nombre === null) {
            return;
        }

        let patch: any;
        let alertCount = 0;
        if (this.accion === 'suspenderTurno') {
            patch = {
                op: this.accion,
                turnos: this.turnosSeleccionados.map((resultado) => {
                    return resultado.id;
                }),
                motivoSuspension: this.motivoSuspensionSelect.select.nombre
            };
        } else {
            patch = {
                op: this.accion,
                estado: this.accion
            };
        }
        // Patchea los turnosSeleccionados (1 o más)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(
            resultado => {
                if (alertCount === 0) {
                    if (this.turnosSeleccionados.length === 1) {
                        this.plex.toast('success', 'El turno seleccionado fue suspendido.');
                    } else {
                        this.plex.toast('success', 'Los turnos seleccionados fueron suspendidos.');
                    }
                    alertCount++;
                }

                this.agenda = resultado;
                this.suspendio = true;
                this.saveSuspenderTurno.emit(this.agenda);

                // Se envían notificación sólo en Producción
                if (environment.production === true) {
                    for (let x = 0; x < this.seleccionadosSMS.length; x++) {
                        this.enviarNotificacion(this.seleccionadosSMS[x]);
                    }
                } else {
                    this.plex.toast('info', 'INFO: notificacion no enviado (activo sólo en Producción)');
                }
            },
        );

    }

    agregarPacienteListaEspera() {

        for (let x = 0; x < this.turnos.length; x++) {
            const patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.turnos[x]
            };

            this.suspenderTurno();

            this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

                this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                    this.saveSuspenderTurno.emit(resulAgenda);

                    this.plex.info('warning', 'Los pacientes seleccionados pasaron a Lista de Espera');

                    // this.enviarSMS(this.turnos[x], 'Su turno fue cancelado, queda en lista de espera');

                });
            });
        }
    }

    reasignarTurno(paciente: any) {
        this.reasignar = { 'paciente': paciente.paciente, 'idTurno': paciente.id, 'idAgenda': this.agenda.id };

        this.suspenderTurno();

        this.reasignarTurnoSuspendido.emit(this.reasignar);
    }

    enviarNotificacion(turno) {
        if (!turno.paciente?.telefono) {
            return;
        }
        const params = {
            evento: 'notificaciones:turno:suspender',
            dto: turno
        };
        this.smsService.enviarNotificacion(params).subscribe(resultado => { });
    }

    cancelar() {
        this.cancelaSuspenderTurno.emit(true);
        this.turnos = [];
    }

    cerrar() {
        this.saveSuspenderTurno.emit(this.agenda);
    }

}
