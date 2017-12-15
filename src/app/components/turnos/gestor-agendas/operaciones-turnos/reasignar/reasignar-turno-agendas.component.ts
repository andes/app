import { environment } from './../../../../../../environments/environment';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';
import { IBloque } from './../../../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { SmsService } from './../../../../../services/turnos/sms.service';
import * as moment from 'moment';

@Component({
    selector: 'reasignar-turno-agendas',
    templateUrl: 'reasignar-turno-agendas.html',
    styleUrls: [
        'reasignar-turno-agendas.scss'
    ]
})

export class ReasignarTurnoAgendasComponent implements OnInit {

    @Input() agendasSimilares: any;
    @Input() agendaAReasignar: any;
    @Input() smsStatus: boolean;

    turnoReasignado: any = {};
    // Para cálculos de disponibilidad de turnos programados y del día
    hoy: Date;
    delDiaDisponibles: number;
    // Agenda destino, elegida entre las candidatas (agendasSimilares)
    agendaSeleccionada: any;

    // Agenda destino
    private _agendaDestino;
    @Input('agendaDestino')
    set agendaDestino(value: any) {
        this._agendaDestino = value;
    }
    get agendaDestino(): any {
        return this._agendaDestino;
    }

    private _turnoSeleccionado;
    @Input('turnoSeleccionado')
    set turnoSeleccionado(value: any) {
        this._turnoSeleccionado = value;
    }

    get turnoSeleccionado(): any {
        return this._turnoSeleccionado;
    }

    private _datosAgenda;
    @Input('datosAgenda') // IDs de agenda y bloque del turno origen
    set datosAgenda(value: any) {
        this._datosAgenda = value;
    }

    get datosAgenda(): any {
        return this._datosAgenda;
    }

    @Output() turnoReasignadoEmit = new EventEmitter<any>();

    autorizado: any;
    countBloques = [];

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService,
        public serviceTurno: TurnoService, public smsService: SmsService) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:reasignarTurnos:?').length > 0;
        this.agendasSimilares = [];
    }

    seleccionarCandidata(indiceTurno, indiceBloque, indiceAgenda) {

        let turno = this.agendasSimilares[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno];
        let turnoSiguiente = this.agendasSimilares[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno + 1];
        let bloque = this.agendasSimilares[indiceAgenda].bloques[indiceBloque];
        this.agendaSeleccionada = this.agendasSimilares[indiceAgenda];
        let tipoTurno;

        // Si la agenda es del día
        if (this.agendaSeleccionada.horaInicio >= moment().startOf('day').toDate() &&
            this.agendaSeleccionada.horaInicio <= moment().endOf('day').toDate()) {
            tipoTurno = 'delDia';
            // Si no es del dia, chequeo el estado para definir el tipo de turno
        } else {

            tipoTurno = turno.tipoTurno !== null ? turno.tipoTurno : 'sin-tipo';

            // if (this.agendaSeleccionada.estado === 'disponible') {
            //     tipoTurno = 'gestion';
            // }

            // if (this.agendaSeleccionada.estado === 'publicada') {
            //     tipoTurno = 'programado';
            // }
        }

        // Creo el Turno nuevo
        let datosTurnoNuevo = {
            idAgenda: this.agendaSeleccionada._id,
            idBloque: bloque._id,
            idTurno: turno._id,
            paciente: this.turnoSeleccionado.paciente,
            tipoPrestacion: this.turnoSeleccionado.tipoPrestacion,
            tipoTurno: tipoTurno,
            reasignado: {
                anterior: {
                    idAgenda: this.datosAgenda.idAgenda,
                    idBloque: this.datosAgenda.idBloque,
                    idTurno: this.datosAgenda.idTurno
                }
            }
        };

        // ¿Ragnar Turno?
        this.plex.confirm('Del ' + moment(this.turnoSeleccionado.horaInicio).format('DD/MM/YYYY [a las] HH:mm [hs]') + ' al ' + moment(turno.horaInicio).format('DD/MM/YYYY [a las] HH:mm [hs]'), '¿Reasignar Turno?').then((confirmado) => {

            if (!confirmado) {
                return false;
            }

            // Guardo el Turno nuevo en la Agenda seleccionada como destino (PATCH)
            // y guardo los datos del turno "viejo/suspendido" en la nueva para poder referenciarlo
            this.serviceTurno.save(datosTurnoNuevo).subscribe(resultado => {

                let turnoReasignado = this.turnoSeleccionado;
                let siguiente = {
                    idAgenda: this.agendaSeleccionada._id,
                    idBloque: this.agendaSeleccionada.bloques[indiceBloque]._id,
                    idTurno: this.agendaSeleccionada.bloques[indiceBloque].turnos[indiceTurno]._id
                };

                if (turnoReasignado.reasignado) {
                    turnoReasignado.reasignado.siguiente = siguiente;
                } else {
                    turnoReasignado.reasignado = {
                        siguiente: siguiente
                    };
                }

                // Datos del turno "nuevo", que se guardan en el turno "viejo" para poder referenciarlo
                let datosTurnoReasignado = {
                    idAgenda: this.agendaAReasignar.id,
                    idTurno: this.datosAgenda.idTurno,
                    idBloque: this.datosAgenda.idBloque,
                    turno: turnoReasignado
                };

                // Se guardan los datos del turno "nuevo" en el turno "viejo/suspendido" (PUT)
                this.serviceTurno.put(datosTurnoReasignado).subscribe(agenda => {
                    this.agendaDestino.agenda = resultado;
                    this.agendaDestino.turno = turno;
                    this.plex.toast('success', 'El turno se reasignó correctamente');

                    // Enviar SMS sólo en Producción
                    if (environment.production === true && this.smsStatus) {
                        let dia = moment(turno.horaInicio).format('DD/MM/YYYY');
                        let tm = moment(turno.horaInicio).format('HH:mm');
                        let mensaje = 'AVISO: Se reasignó su turno al ' + dia + ' a las ' + tm + ' hs. para ' + this.turnoSeleccionado.tipoPrestacion;
                        this.plex.toast('info', 'Se informó al paciente mediante un SMS');
                        this.enviarSMS(this.turnoSeleccionado.paciente, mensaje);
                        // this.actualizarCarpetaPaciente(turno.paciente);
                    } else {
                        this.plex.toast('info', 'INFO: SMS no enviado');
                    }
                    if (this.esTurnoDoble(turnoReasignado)) {
                        let patch: any = {
                            op: 'darTurnoDoble',
                            turnos: [turnoSiguiente]
                        };
                        // Patchea el turno doble
                        this.serviceAgenda.patchMultiple(this.agendaSeleccionada._id, patch).subscribe((agendaActualizada) => {
                            if (agendaActualizada) {
                                this.plex.toast('info', 'Se reasignó un turno doble');
                            }
                        });
                    }
                    this.turnoReasignadoEmit.emit({
                        turno: turnoReasignado,
                        bloque: { id: this.datosAgenda.idBloque }
                    });
                });


            });
        });

    }

    // esta funcion se repite en suspender turno
    // TODO: aplicar buenas practicas de programacion
    enviarSMS(paciente: any, mensaje) {
        let smsParams = {
            telefono: paciente.telefono,
            mensaje: mensaje,
        };
        this.smsService.enviarSms(smsParams).subscribe(sms => {
            let resultado = sms;

            // "if 0 errores"
            if (resultado === '0') {
                this.plex.toast('info', 'Se envió SMS al paciente ' + paciente.nombreCompleto);
            } else {
                this.plex.toast('danger', 'ERROR: SMS no enviado');
            }
        },
            err => {
                if (err) {
                    this.plex.toast('danger', 'ERROR: Servicio caído');

                }
            });
    }

    hayTurnosDisponibles(agenda: IAgenda) {
        return agenda.bloques.filter(bloque => {
            return (bloque.restantesDelDia > 0 && moment(bloque.horaInicio).isSame(this.hoy, 'day')) ||
                   (bloque.restantesProgramados > 0 && moment(bloque.horaInicio).isAfter(this.hoy, 'day'));
        }).length > 0;
    }

    siguienteDisponible(bloque, turno, indiceTurno) {
        if (((indiceTurno < bloque.turnos.length - 1) && (bloque.turnos[indiceTurno + 1].estado !== 'disponible')) || (indiceTurno === (bloque.turnos.length - 1))) {
            return false;
        }
        if (bloque.citarPorBloque) {
            if (String(bloque.turnos[indiceTurno].horaInicio) !== String(bloque.turnos[indiceTurno + 1].horaInicio)) {
                return false;
            }
        }
        return true;
    }

    tieneTurnos(bloque: IBloque): boolean {
        let turnos = bloque.turnos;
        return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= (new Date())) != null;
    }

    existePrestacion(bloque: any, idPrestacion: string) {
        return bloque.tipoPrestaciones.find((tp) => {
            return tp._id === idPrestacion;
        });
    }

    primerSimultaneoDisponible(bloque: IBloque, turno: ITurno, indiceT: number) {
        return (indiceT - 1 < 0)
            || (turno.horaInicio.getTime() !== bloque.turnos[(indiceT - 1)].horaInicio.getTime())
            || ((turno.horaInicio.getTime() === bloque.turnos[(indiceT - 1)].horaInicio.getTime())
                && (bloque.turnos[(indiceT - 1)].estado !== 'disponible'));
    }

    getHora(fecha) {
        return moment(fecha).format('HH:mm');
    }

    getFecha(fecha) {
        return moment(fecha).format('DD/MM/YYYY');
    }


    esTurnoDoble(turno) {
        let bloqueTurno = this.agendaAReasignar.bloques.find(bloque => (bloque.turnos.findIndex(t => (t.id === turno._id)) >= 0));
        let index;
        if (bloqueTurno) {
            index = bloqueTurno.turnos.findIndex(t => { return t.id === turno._id; });
            if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'turnoDoble')) || (index === (bloqueTurno.turnos.length - 1))) {
                return false;
            } else {
                return true;
            }
        }
    }

}
