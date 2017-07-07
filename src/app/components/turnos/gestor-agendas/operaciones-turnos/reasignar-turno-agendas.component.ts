import { IBloque } from './../../../../interfaces/turnos/IBloque';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../services/turnos/turno.service';
// import { SmsService } from './../../../../services/turnos/sms.service';
import * as moment from 'moment';

@Component({
    selector: 'reasignar-turno-agendas',
    templateUrl: 'reasignar-turno-agendas.html'
})

export class ReasignarTurnoAgendasComponent implements OnInit {
    hoy: Date;
    delDiaDisponibles: number;

    private _agendasSimilares: any;
    @Input('agendasSimilares')
    set agendasSimilares(value: any) {
        this._agendasSimilares = value;
    }
    get agendasSimilares(): any {
        return this._agendasSimilares;
    }

    @Input() turnoSeleccionado: any;
    @Input() agendaAReasignar: IAgenda; // Agenda origen
    @Input() datosAgenda: any; // IDs de agenda, bloque origen
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


    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();
    @Output() cancelaSuspenderTurno = new EventEmitter<boolean>();
    @Output() reasignacionManualEmit = new EventEmitter<boolean>();

    public turnoAReasignar: any;

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    autorizado: any;
    countBloques = [];

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.actualizar();
    }

    actualizar() {
        console.log(this.agendasSimilares);

        this.delDiaDisponibles = 0;
        this.agendasSimilares = [];
        let turnoAnterior = null;

        if (this.agendasSimilares) {
            this.agendasSimilares.forEach(agenda => {
                agenda.bloques.forEach((bloque, indexBloque) => {

                    this.countBloques.push({
                        delDia: ((bloque.accesoDirectoDelDia as number) + (bloque.accesoDirectoProgramado as number)),
                        programado: 0,
                        gestion: bloque.reservadoGestion,
                        profesional: bloque.reservadoProfesional
                    });
                    bloque.turnos.forEach((turno) => {
                        // Si el turno está asignado o está disponible pero ya paso la hora
                        if (turno.estado === 'asignado' || (turno.estado === 'turnoDoble') || (turno.estado === 'disponible' && turno.horaInicio < this.hoy)) {
                            if (turno.estado === 'turnoDoble' && turnoAnterior) {
                                turno = turnoAnterior;
                            }
                            switch (turno.tipoTurno) {
                                case ('delDia'):
                                    this.countBloques[indexBloque].delDia--;
                                    break;
                                case ('programado'):
                                    this.countBloques[indexBloque].delDia--;
                                    break;
                                case ('profesional'):
                                    this.countBloques[indexBloque].profesional--;
                                    break;
                                case ('gestion'):
                                    this.countBloques[indexBloque].gestion--;
                                    break;
                                default:
                                    this.delDiaDisponibles--;
                                    break;
                            }
                        }

                        turnoAnterior = turno;

                    });
                    this.delDiaDisponibles = this.delDiaDisponibles + this.countBloques[indexBloque].delDia;

                });
            });
        }
    }

    seleccionarCandidata(indiceTurno, indiceBloque, indiceAgenda) {

        let turno = this.agendasSimilares[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno];
        let bloque = this.agendasSimilares[indiceAgenda].bloques[indiceBloque];
        this.agendaSeleccionada = this.agendasSimilares[indiceAgenda];
        let tipoTurno;

        // Si la agenda es del día
        if (this.agendaSeleccionada.horaInicio >= moment().startOf('day').toDate() &&
            this.agendaSeleccionada.horaInicio <= moment().endOf('day').toDate()) {
            tipoTurno = 'delDia';
            // Si no es del dia, chequeo el estado para definir el tipo de turno
        } else {
            if (this.agendaSeleccionada.estado === 'disponible') {
                tipoTurno = 'gestion';
            }

            if (this.agendaSeleccionada.estado === 'publicada') {
                tipoTurno = 'programado';
            }
        }

        // Creo el Turno nuevo
        let datosTurno = {
            idAgenda: this.agendaSeleccionada._id,
            idBloque: bloque._id,
            idTurno: turno._id,
            paciente: this.turnoSeleccionado.paciente,
            tipoPrestacion: this.turnoSeleccionado.tipoPrestacion,
            tipoTurno: tipoTurno,
            // Guardo los datos de la agenda "vieja/anterior" en la nueva
            reasignado: {
                anterior: {
                    idAgenda: this.datosAgenda.idAgenda,
                    idBloque: this.datosAgenda.idBloque,
                    idTurno: this.datosAgenda.idTurno
                }
            }
        };

        this.plex.confirm('¿Reasignar Turno?').then((confirmado) => {
            if (!confirmado) {
                return false;
            }

            // Guardo el Turno nuevo en la Agenda seleccionada como destino (PATCH)
            this.serviceTurno.save(datosTurno).subscribe(resultado => {
                // TODO: hacer un PUT con el id de la agenda en el campo turno.reasignado de la agenda original
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

                let params = {
                    idAgenda: this.agendaAReasignar.id,
                    idTurno: this.datosAgenda.idTurno,
                    idBloque: this.datosAgenda.idBloque,
                    turno: turnoReasignado // Guardo los datos de la agenda "nueva" en el turno viejo
                };

                console.log('params', params);


                // Agrego datos de reasignación al turno original (PUT)
                this.serviceTurno.put(params).subscribe(resultado2 => {
                    this.plex.toast('success', 'El turno se reasignó correctamente');
                    this.actualizar();
                });

                // Enviar SMS
                // let dia = moment(this.turno.horaInicio).format('DD/MM/YYYY');
                // let tm = moment(this.turno.horaInicio).format('HH:mm');
                // let mensaje = 'Usted tiene un turno el dia ' + dia + ' a las ' + tm + ' hs. para ' + this.turnoTipoPrestacion.nombre;
                // this.enviarSMS(pacienteSave, mensaje);
                // this.actualizarCarpetaPaciente(turno.paciente);
            });
        });

    }

    public tieneTurnos(bloque: IBloque): boolean {
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


}
