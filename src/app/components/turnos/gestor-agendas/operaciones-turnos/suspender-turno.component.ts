import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../../../services/turnos/listaEspera.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { SmsService } from './../../../../services/turnos/sms.service';

@Component({
    selector: 'suspender-turno',
    templateUrl: 'suspender-turno.html'
})

export class SuspenderTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() turnosSeleccionados: ITurno[];

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

    ngOnInit() {
        this.turnos = this.turnosSeleccionados;

        this.motivoSuspension = [{
            id: 1,
            nombre: 'edilicia'
        }, {
            id: 2,
            nombre: 'profesional'
        },
        {
            id: 3,
            nombre: 'organizacion'
        }];

        this.motivoSuspensionSelect.select = this.motivoSuspension[1];
        this.turnos.forEach((turno) => {
            this.seleccionarTurno(turno);
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

    fueEnviado(turno) {
        return this.estaSeleccionado(turno) && turno.paciente && this.smsEnviado(turno) === 'enviado';
    }

    estaPendiente(turno) {
        return this.estaSeleccionado(turno) && turno.paciente && this.smsEnviado(turno) === 'pendiente';
    }

    tienePaciente(turno) {
        return turno.paciente != null;
    }

    suspenderTurno() {
        let patch: any = {
            op: 'suspenderTurno',
            turnos: this.turnos,
            motivoSuspension: this.motivoSuspensionSelect.select.nombre
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patchMultiple(this.agenda.id, patch).subscribe(

            resultado => {
                this.agenda = resultado;
                if (this.turnos.length === 1) {
                    this.plex.toast('warning', 'El turno seleccionado fue suspendido');
                } else {
                    this.plex.toast('warning', 'Los turnos seleccionados fueron suspendidos');
                }
                this.suspendio = true;
                // TODO: Descomentar para que envíe SMS
                // for (let x = 0; x < this.seleccionadosSMS.length; x++) {
                //     this.enviarSMS(this.seleccionadosSMS[x], 'Su turno fue suspendido');
                //     if (x === this.enviarSMS.length - 1) {
                //         console.log('recorrio todo ', this.seleccionadosSMS);
                //     }
                // };
            },
            err => {
                if (err) {
                    console.log(err);
                }
            }

        );
    }

    agregarPacienteListaEspera() {

        for (let x = 0; x < this.turnos.length; x++) {
            let patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.turnos[x]
            };

            this.suspenderTurno();

            this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

                this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                    this.saveSuspenderTurno.emit(resulAgenda);

                    this.plex.alert('Los pacientes seleccionados pasaron a Lista de Espera');

                    // this.enviarSMS(this.turnos[x], 'Su turno fue cancelado, queda en lista de espera');

                });
            });
        }
    }

    reasignarTurno(paciente: any) {
        this.reasignar = { 'paciente': paciente.paciente, 'idTurno': paciente.id, 'idAgenda': this.agenda.id };

        this.suspenderTurno();

        // this.enviarSMS(paciente, 'Su turno se suspendió, será reasignado');

        this.reasignarTurnoSuspendido.emit(this.reasignar);
    }

    enviarSMS(turno: any, mensaje) {
        // this.smsLoader = true;

        // console.log('paciente ', paciente);

        let smsParams = {
            telefono: turno.paciente.telefono,
            mensaje: mensaje,
        };
        let indice = this.seleccionadosSMS.indexOf(turno);

        this.smsService.enviarSms(smsParams).subscribe(
            resultado => {
                this.resultado = resultado;
                // this.smsLoader = false;
                if (resultado === '0') {
                    this.seleccionadosSMS[indice].smsEnviado = true;
                } else {
                    this.seleccionadosSMS[indice].smsEnviado = false;
                }
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    smsEnviado(turno) {
        let ind = this.seleccionadosSMS.indexOf(turno);
        if (ind >= 0) {
            if (this.seleccionadosSMS[ind].smsEnviado === undefined) {
                return 'no enviado';
            } else {
                if (this.seleccionadosSMS[ind].smsEnviado === true) {
                    return 'enviado';
                } else {
                    return 'pendiente';
                }
            }
        } else {
            return 'no seleccionado';
        }
    }

    cancelar() {
        this.cancelaSuspenderTurno.emit(true);
        this.turnos = [];
    }

    cerrar() {
        this.saveSuspenderTurno.emit(this.agenda);
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService, public smsService: SmsService) { }
}
