import { environment } from './../../../../../../environments/environment';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IBloque } from './../../../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { SmsService } from './../../../../../services/turnos/sms.service';
import * as moment from 'moment';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { map } from 'rxjs/operators';

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
                public serviceTurno: TurnoService, public smsService: SmsService, public prestacionesService: PrestacionesService) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:reasignarTurnos:?').length > 0;
        this.agendasSimilares = [];
    }

    asignarTipoTurno(bloque, turnoSuspendido) {
        let tipoTurno;

        if (turnoSuspendido && bloque.restantesGestion > 0) {
            tipoTurno = 'gestion';

            return tipoTurno;
        }

        // Si la agenda es del día
        if (this.agendaSeleccionada.estado === 'publicada' && this.agendaSeleccionada.horaInicio >= moment().startOf('day').toDate() &&
            this.agendaSeleccionada.horaInicio <= moment().endOf('day').toDate()) {
            tipoTurno = 'delDia';
            // Si no es del dia, chequeo el estado para definir el tipo de turno
        } else {
            if (this.agendaSeleccionada.estado === 'publicada' && bloque.restantesProgramados > 0) {
                tipoTurno = 'programado';
            } else {
                if (bloque.restantesGestion > 0 && this.turnoSeleccionado.tipoTurno === 'gestion') {
                    tipoTurno = 'gestion';
                } else {
                    if (bloque.restantesProfesional > 0 && this.turnoSeleccionado.tipoTurno === 'profesional') {
                        tipoTurno = 'profesional';
                    }
                }
            }
        }

        return tipoTurno;
    }

    asignarTurno(bloque, turno, turnoSiguiente, indiceBloque, indiceTurno, solicitud, tipoTurno) {
        // Creo el Turno nuevo
        const datosTurnoNuevo = {
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

        // ¿Reasignar Turno?
        this.plex.confirm('Del ' + moment(this.turnoSeleccionado.horaInicio).format('DD/MM/YYYY [a las] HH:mm [hs]') + ' al ' + moment(turno.horaInicio).format('DD/MM/YYYY [a las] HH:mm [hs]'), '¿Reasignar Turno?').then((confirmado) => {

            if (!confirmado) {
                return false;
            }

            // Guardo el Turno nuevo en la Agenda seleccionada como destino (PATCH)
            // y guardo los datos del turno "viejo/suspendido" en la nueva para poder referenciarlo
            this.serviceTurno.save(datosTurnoNuevo).subscribe(resultado => {

                const turnoReasignado = this.turnoSeleccionado;
                const siguiente = {
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
                const datosTurnoReasignado = {
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
                        const diaOrig = moment(datosTurnoReasignado.turno.horaInicio).format('DD/MM/YYYY');
                        const tmOrig = moment(datosTurnoReasignado.turno.horaInicio).format('HH:mm');
                        const dia = moment(turno.horaInicio).format('DD/MM/YYYY');
                        const tm = moment(turno.horaInicio).format('HH:mm');
                        const mensaje = 'AVISO:  Su turno de ' + this.turnoSeleccionado.tipoPrestacion.term + ' del ' + diaOrig + ' a las ' + tmOrig
                            + ' hs. fue REASIGNADO  al ' + dia + ' a las ' + tm + ' hs.   ' + this.auth.organizacion.nombre;
                        this.plex.toast('info', 'Se informó al paciente mediante un SMS');
                        this.enviarSMS(this.turnoSeleccionado.paciente, mensaje);
                    } else {
                        this.plex.toast('info', 'INFO: SMS no enviado');
                    }
                    if (this.esTurnoDoble(turnoReasignado)) {
                        const patch: any = {
                            op: 'darTurnoDoble',
                            turnos: [turnoSiguiente._id]
                        };
                        // Patchea el turno doble
                        this.serviceAgenda.patch(this.agendaSeleccionada._id, patch).subscribe((agendaActualizada) => {
                            if (agendaActualizada) {
                                this.plex.toast('info', 'Se reasignó un turno doble');
                            }
                        });
                    }
                    this.turnoReasignadoEmit.emit({
                        turno: turnoReasignado,
                        bloque: { id: this.datosAgenda.idBloque }
                    });

                    if (solicitud && tipoTurno !== 'gestion') {
                        const params = {
                            op: 'asignarTurno',
                            idTurno: turno.id
                        };

                        this.prestacionesService.patch(solicitud.id, params);
                    }
                });
            });
        });
    }

    obtenerSuspendido() {
        const params = {
            idPaciente: this.turnoSeleccionado?.paciente?.id,
            prestacionDestino: this.turnoSeleccionado?.tipoPrestacion?.conceptId,
            turnoSuspendido: this.turnoSeleccionado.id
        };

        let turnoSuspendido;

        return this.prestacionesService.getSolicitudes(params).pipe(
            map((prestaciones) => {
                const solicitud = prestaciones.find((prestacion) => {
                    turnoSuspendido = prestacion.solicitud?.historial?.find(item => item.idTurnoSuspendido === this.turnoSeleccionado.id);

                    return !!turnoSuspendido;
                });
                return { solicitud, turnoSuspendido };
            })
        );
    }

    seleccionarCandidata(indiceTurno, indiceBloque, indiceAgenda) {
        const turno = this.agendasSimilares[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno];
        const turnoSiguiente = this.agendasSimilares[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno + 1];
        const bloque = this.agendasSimilares[indiceAgenda].bloques[indiceBloque];

        this.agendaSeleccionada = this.agendasSimilares[indiceAgenda];

        if (this.turnoSeleccionado) {
            this.obtenerSuspendido().subscribe(({ solicitud, turnoSuspendido }) => {
                const tipoTurno = this.asignarTipoTurno(bloque, turnoSuspendido);

                this.asignarTurno(bloque, turno, turnoSiguiente, indiceBloque, indiceTurno, solicitud, tipoTurno);
            });
        }
    }

    // esta funcion se repite en suspender turno
    // TODO: aplicar buenas practicas de programacion
    enviarSMS(paciente: any, mensaje) {
        if (!paciente.telefono) {
            return;
        }
        const smsParams = {
            telefono: paciente.telefono,
            mensaje: mensaje,
        };
        this.smsService.enviarSms(smsParams).subscribe(sms => {
            const resultado = sms;
            // "if 0 errores"
            if (resultado === '0') {
                this.plex.toast('info', 'Se envió SMS al paciente ' + (paciente.alias || paciente.nombre) + ' ' + paciente.apellido);
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

    hayTurnosDisponibles(agenda: any) {
        const profesionalOrigen = (this.agendaAReasignar.profesionales && this.agendaAReasignar.profesionales.length > 0) ? this.agendaAReasignar.profesionales[0].id : null;
        const profesionalDestino = (agenda.profesionales && agenda.profesionales.length > 0) ? agenda.profesionales[0]._id : null;
        return agenda.bloques.filter(bloque => {
            return (bloque.restantesDelDia > 0 && moment(bloque.horaInicio).isSame(this.hoy, 'day')) ||
                (bloque.restantesProgramados > 0 && moment(bloque.horaInicio).isAfter(this.hoy, 'day') ||
                    (bloque.restantesGestion > 0 && this.turnoSeleccionado.tipoTurno === 'gestion') ||
                    (bloque.restantesProfesional > 0 && this.turnoSeleccionado.tipoTurno === 'profesional'
                        && profesionalOrigen && profesionalDestino && profesionalOrigen === profesionalDestino)
                );
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
        const turnos = bloque.turnos;
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
        const bloqueTurno = this.agendaAReasignar.bloques.find(bloque => (bloque.turnos.findIndex(t => (t.id === turno._id)) >= 0));
        let index;
        if (bloqueTurno) {
            index = bloqueTurno.turnos.findIndex(t => {
                return t.id === turno._id;
            });
            if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'turnoDoble')) || (index === (bloqueTurno.turnos.length - 1))) {
                return false;
            } else {
                return true;
            }
        }
    }

}
