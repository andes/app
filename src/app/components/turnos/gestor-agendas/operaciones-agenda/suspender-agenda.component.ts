import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { environment } from './../../../../environment';
import * as moment from 'moment';
import { SmsService } from './../../../../services/turnos/sms.service';
import { TurnoService } from './../../../../services/turnos/turno.service'
@Component({
    selector: 'suspender-agenda',
    templateUrl: 'suspender-agenda.html'
})

export class SuspenderAgendaComponent implements OnInit {
    resultado: String;
    seleccionadosSMS = [];


    @Input() agenda: IAgenda;
    @Output() returnSuspenderAgenda = new EventEmitter<boolean>();


    constructor(public plex: Plex, public serviceAgenda: AgendaService, public smsService: SmsService, public turnosService: TurnoService) { }

    public motivoSuspensionSelect = { select: null };
    public motivoSuspension: { id: number; nombre: string; }[];
    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public showConfirmar = false;
    public turnos = [];
    ngOnInit() {
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

        (this.agenda.estado !== 'suspendida') ? this.showConfirmar = true : this.showData = true;
    }

    suspenderAgenda() {
        this.showConfirmar = false;
        this.showData = true;
        if (this.motivoSuspensionSelect.select.nombre === null) {
            return;
        }

        let patch = {
            'op': 'suspendida',
            'estado': 'suspendida'
        };

        this.serviceAgenda.patch(this.agenda.id, patch).subscribe((resultado: any) => {
            // Si son múltiples, esperar a que todas se actualicen
            this.agenda.estado = resultado.estado;
            this.plex.toast('success', 'Información', 'La agenda cambió el estado a Suspendida');
        });
        this.returnSuspenderAgenda.emit(true);
    }

    cancelar() {
        this.showConfirmar = false;
        this.showData = false;
        this.returnSuspenderAgenda.emit(true);
    }


    notificar() {
        // Se envían SMS sólo en Producción
        // if (environment.production === true) {
        for (let x = 0; x < this.seleccionadosSMS.length; x++) {

            let dia = moment(this.seleccionadosSMS[x].horaInicio).format('DD/MM/YYYY');
            let horario = moment(this.seleccionadosSMS[x].horaInicio).format('HH:mm');
            let mensaje = 'Le informamos que su turno del dia ' + dia + ' a las ' + horario + ' horas fue suspendido.';
            this.seleccionadosSMS[x].smsEnviado = 'pendiente';
            this.seleccionadosSMS[x].smsEnviado = this.send(this.seleccionadosSMS[x], mensaje);
        };
        // } else {
        //     this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
        // }

    }

    send(turno: any, mensaje) {
        let smsParams = {
            telefono: turno.paciente.telefono,
            mensaje: mensaje,
        };
        let idBloque;
        this.agenda.bloques.forEach(element => {
            let indice = element.turnos.findIndex(t => {
                return (t.id === turno.id);
            });
            if (indice !== -1) {
                idBloque = element.id;
            }
        });
        this.smsService.enviarSms(smsParams).subscribe(
            sms => {
                if (sms === '0') {
                    this.plex.toast('info', 'Se envió SMS al paciente ' + turno.paciente.nombreCompleto);
                    let data = {
                        idAgenda: this.agenda.id,
                        idBloque: idBloque,
                        idTurno: turno.id,
                        avisoSuspension: 'enviado'
                    };
                    this.turnosService.patch(data).subscribe(resultado => {
                        console.log(resultado);
                    });
                }
            },
            err => {
                if (err) {
                    this.plex.toast('danger', 'ERROR: Servicio caído');
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
    seleccionarTurno(turno) {
        let indice = this.seleccionadosSMS.indexOf(turno);
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
}
