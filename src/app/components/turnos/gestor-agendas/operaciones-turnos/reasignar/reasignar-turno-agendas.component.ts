import { environment } from './../../../../../../environments/environment';
import { Component, Input, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IBloque } from './../../../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { SmsService } from './../../../../../services/turnos/sms.service';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { map } from 'rxjs/operators';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';

@Component({
    selector: 'reasignar-turno-agendas',
    templateUrl: 'reasignar-turno-agendas.html',
    styleUrls: [
        'reasignar-turno-agendas.scss'
    ]
})

export class ReasignarTurnoAgendasComponent implements OnInit {

    @ViewChild('formu', { static: false }) formu: NgForm;

    @Input() smsStatus: boolean;
    @Input() agendaAReasignar;

    private _agendasSimilares: IAgenda[];
    @Input()
    set agendasSimilares(value: IAgenda[]) {
        if (value) {
            this._agendasSimilares = value.filter(ag => moment(ag.horaFin).isAfter(moment()));
            this.agendasEnTabla = this._agendasSimilares;
        }
    }
    get agendasSimilares() {
        return this._agendasSimilares;
    }

    private _agendaDestino;
    @Input('agendaDestino')
    set agendaDestino(value: any) {
        this._agendaDestino = value;
    }
    get agendaDestino(): any {
        return this._agendaDestino;
    }

    private _turnoAReasignar;
    @Input('turnoAReasignar')
    set turnoAReasignar(value: any) {
        if (value?._id === this._turnoAReasignar?._id) {
            this._turnoAReasignar = null;
        } else {
            this._turnoAReasignar = value;
            this.seleccionarAgenda(null);
        }
        this.showHorarios = false;
    }
    get turnoAReasignar(): any {
        return this._turnoAReasignar;
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
    @Output() crearAgendaEmit = new EventEmitter<any>();

    public turnoReasignado: any = {};
    // Para cálculos de disponibilidad de turnos programados y del día
    public hoy: Date;
    // Agenda destino, elegida entre las candidatas (agendasSimilares)
    public agendaSeleccionada: IAgenda;
    public agendasEnTabla: IAgenda[] = [];
    public turnoSeleccionado: any;
    public turnoSiguiente: any;
    public bloqueSeleccionado: any;
    public showHorarios = false;
    public collapse = false;
    public chequed = true;
    public autorizado: any;
    public countBloques = [];

    private reasignado = false;

    constructor(
        public plex: Plex,
        public auth: Auth,
        public serviceAgenda: AgendaService,
        public serviceTurno: TurnoService,
        public smsService: SmsService,
        public prestacionesService: PrestacionesService) { }

    public showCrearAgenda = false;

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:reasignarTurnos:?').length > 0;
        this.agendasSimilares = [];
    }

    seleccionarHorarioTurno(bloque: IBloque, turno: ITurno) {
        if (this.turnoSeleccionado?._id === turno._id || turno.estado !== 'disponible') {
            this.turnoSeleccionado = null;
            this.turnoSiguiente = null;
            // this.showHorarios = false;
        } else {
            this.turnoSeleccionado = turno;
            const indiceTurno = bloque.turnos.findIndex(t => t._id === turno._id);
            this.turnoSiguiente = bloque.turnos[indiceTurno + 1];
            this.bloqueSeleccionado = bloque;
            this.showHorarios = true;
        }
    }

    asignarTurno(bloque, turno, turnoSiguiente, solicitud, tipoTurno) {
        // Creo el Turno nuevo
        const datosTurnoNuevo = {
            idAgenda: this.agendaSeleccionada._id,
            idBloque: bloque._id,
            idTurno: turno._id,
            paciente: this.turnoAReasignar.paciente,
            tipoPrestacion: this.turnoAReasignar.tipoPrestacion,
            tipoTurno: tipoTurno,
            reasignado: {
                anterior: {
                    idAgenda: this.datosAgenda.idAgenda,
                    idBloque: this.datosAgenda.idBloque,
                    idTurno: this.datosAgenda.idTurno
                }
            }
        };

        // Guardo el Turno nuevo en la Agenda seleccionada como destino (PATCH)
        // y guardo los datos del turno "viejo/suspendido" en la nueva para poder referenciarlo
        this.serviceTurno.save(datosTurnoNuevo).subscribe(resultado => {

            const turnoReasignado = this.turnoAReasignar;
            const siguiente = {
                idAgenda: this.agendaSeleccionada._id,
                idBloque: this.bloqueSeleccionado._id,
                idTurno: this.turnoSeleccionado._id
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
                idAgenda: this.agendaAReasignar._id,
                idTurno: this.datosAgenda.idTurno,
                idBloque: this.datosAgenda.idBloque,
                turno: turnoReasignado
            };

            // Se guardan los datos del turno "nuevo" en el turno "viejo/suspendido" (PUT)
            this.serviceTurno.put(datosTurnoReasignado).subscribe(agenda => {
                this.agendaDestino.agenda = resultado;
                this.agendaDestino.turno = turno;

                // Enviar SMS sólo en Producción
                if (environment.production === true && this.smsStatus) {
                    const diaOrig = moment(datosTurnoReasignado.turno.horaInicio).format('DD/MM/YYYY');
                    const tmOrig = moment(datosTurnoReasignado.turno.horaInicio).format('HH:mm');
                    const dia = moment(turno.horaInicio).format('DD/MM/YYYY');
                    const tm = moment(turno.horaInicio).format('HH:mm');
                    const mensaje = 'AVISO:  Su turno de ' + this.turnoAReasignar.tipoPrestacion.term + ' del ' + diaOrig + ' a las ' + tmOrig
                        + ' hs. fue REASIGNADO  al ' + dia + ' a las ' + tm + ' hs.   ' + this.auth.organizacion.nombre;
                    this.plex.toast('info', 'Se informó al paciente mediante un SMS');
                    this.enviarSMS(this.turnoAReasignar.paciente, mensaje);
                } else {
                    this.plex.toast('info', 'INFO: SMS no enviado');
                }
                if (this.esTurnoDoble(turnoReasignado)) {
                    const patch: any = {
                        op: 'darTurnoDoble',
                        turnos: [turnoSiguiente._id]
                    };
                    // Patchea el turno doble
                    this.serviceAgenda.patch(this.agendaSeleccionada._id, patch).subscribe(agendaActualizada => {
                        if (agendaActualizada._id) {
                            this.plex.toast('info', 'Se reasignó un turno doble');
                        }
                    });

                    if (solicitud && tipoTurno !== 'gestion') {
                        const params = {
                            op: 'asignarTurno',
                            idTurno: turno._id
                        };

                        this.prestacionesService.patch(solicitud.id, params);
                    }
                };
                this.turnoReasignadoEmit.emit({
                    turno: turnoReasignado,
                    bloque: { id: this.datosAgenda.idBloque }
                });
                this.reasignado = true;
                this.showHorarios = false;
            });
        });
    }

    obtenerSolicitudSuspendida() {
        const params = {
            idPaciente: this.turnoAReasignar?.paciente?.id,
            prestacionDestino: this.turnoAReasignar?.tipoPrestacion?.conceptId,
            turnoSuspendido: this.turnoAReasignar.id
        };

        let turnoSuspendido;

        return this.prestacionesService.getSolicitudes(params).pipe(
            map((prestaciones) => {
                const solicitud = prestaciones.find((prestacion) => {
                    turnoSuspendido = prestacion.solicitud?.historial?.find(item => item.idTurnoSuspendido === this.turnoAReasignar.id);

                    return !!turnoSuspendido;
                });
                return { solicitud, turnoSuspendido };
            })
        );
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
                if (bloque.restantesGestion > 0 && this.turnoAReasignar.tipoTurno === 'gestion') {
                    tipoTurno = 'gestion';
                } else {
                    if (bloque.restantesProfesional > 0 && this.turnoAReasignar.tipoTurno === 'profesional') {
                        tipoTurno = 'profesional';
                    }
                }
            }
        }
        return tipoTurno;
    }

    reasignarTurno() {
        if (this.turnoSeleccionado && this.turnoAReasignar) {
            this.obtenerSolicitudSuspendida().subscribe(({ solicitud, turnoSuspendido }) => {
                const tipoTurno = this.asignarTipoTurno(this.bloqueSeleccionado, turnoSuspendido);

                this.asignarTurno(this.bloqueSeleccionado, this.turnoSeleccionado, this.turnoSiguiente, solicitud, tipoTurno);
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
        }, err => {
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
                    (bloque.restantesGestion > 0 && this.turnoAReasignar.tipoTurno === 'gestion') ||
                    (bloque.restantesProfesional > 0 && this.turnoAReasignar.tipoTurno === 'profesional'
                        && profesionalOrigen && profesionalDestino && profesionalOrigen === profesionalDestino)
                );
        }).length > 0;
    }

    siguienteDisponible(bloque, indiceTurno) {
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
        return turnos.some(turno => turno.estado === 'disponible' && moment(turno.horaInicio).isSameOrAfter(moment()));
    }

    bloquesSegunPrestacion() {
        const a = this.agendaSeleccionada.bloques.filter(b => {
            return (b as any).tipoPrestaciones.some(tp => tp._id === this.turnoAReasignar.tipoPrestacion.id);
        });
        return a;
    }

    primerSimultaneoDisponible(bloque: IBloque, turno: ITurno, indiceT: number) {
        return (indiceT - 1 < 0)
            || (turno.horaInicio.getTime() !== bloque.turnos[(indiceT - 1)].horaInicio.getTime())
            || ((turno.horaInicio.getTime() === bloque.turnos[(indiceT - 1)].horaInicio.getTime())
                && (bloque.turnos[(indiceT - 1)].estado !== 'disponible'));
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

    seleccionarAgenda(agenda) {
        if (!agenda || agenda?._id === this.agendaSeleccionada?._id) {
            this.agendaSeleccionada = null;
            this.agendasEnTabla = this.agendasSimilares;
            this.showHorarios = false;
        } else {
            this.agendaSeleccionada = agenda;
            this.agendasEnTabla = [this.agendaSeleccionada];
            this.showHorarios = true;
        }
        this.turnoSeleccionado = null;
        this.bloqueSeleccionado = null;
    }

    estaSeleccionada(agenda) {
        return (agenda && agenda._id === this.agendaSeleccionada._id);
    }

    crearAgenda() {
        this.crearAgendaEmit.emit();
    }

    mostrarAgendasSimilares() {
        return this.turnoAReasignar && !this.turnoAReasignar?.reasignado?.siguiente && this.agendasSimilares?.length > 0;
    }

    mostrarHorarioTurno(turno) {
        return turno.horaInicio && moment(turno.horaInicio).isSameOrAfter(moment());
    }

    changeCollapse(event) {
        this.collapse = event;
    }

    cerrarModal() {
        this.reasignado = !this.reasignado;
    }

    turnoSeleccionable(bloque, turno, indiceTurno) {
        if (turno.estado === 'disponible') {
            if (this.esTurnoDoble(this.turnoAReasignar)) {
                return this.siguienteDisponible(bloque, indiceTurno);
            } else {
                if (bloque.pacienteSimultaneos) {
                    return this.primerSimultaneoDisponible(bloque, turno, indiceTurno);
                } else {
                    if (bloque.citarPorBloque) {
                        return this.primerSimultaneoDisponible(bloque, turno, indiceTurno);
                    } else {
                        return true;
                    }
                }
            }
        }
    }
}
