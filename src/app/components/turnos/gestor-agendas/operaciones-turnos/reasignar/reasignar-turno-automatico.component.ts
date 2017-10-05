import { environment } from './../../../../../environment';
import { IBloque } from './../../../../../interfaces/turnos/IBloque';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { SmsService } from '../../../../../services/turnos/sms.service';
import * as moment from 'moment';

@Component({
    selector: 'reasignar-turno-automatico',
    templateUrl: 'reasignar-turno-automatico.html'
})

export class ReasignarTurnoAutomaticoComponent implements OnInit {
    resultado: String;

    private _agendaAReasignar: any;

    @Input('agendaAReasignar')
    set agendaAReasignar(value: any) {
        this._agendaAReasignar = value;
        this.actualizar();
    }
    get agendaAReasignar(): any {
        return this._agendaAReasignar;
    }
    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();
    @Output() cancelaSuspenderTurno = new EventEmitter<boolean>();
    @Output() reasignarTurnosEmit = new EventEmitter<boolean>();

    public turnoAReasignar: ITurno;

    agendasReasignar: any[] = [];
    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    public hoy = new Date();

    agendasOcultas: any[] = [];
    paneles: any[] = [];

    autorizado: any;
    permisosRequeridos = 'reasignarTurnos';


    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService, public smsService: SmsService) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:' + this.permisosRequeridos + ':?').length > 0;
    }

    actualizar() {

        // Función callback para usar con array.sort()
        let sortCandidatas = function (a, b) {
            return a.turno.horaInicio - b.turno.horaInicio;
        };

        this.agendasReasignar = [];

        // Hay alguna agenda seleccionada?
        if (this.agendaAReasignar) {
            this.agendaAReasignar.bloques.forEach(bloque => {
                bloque.turnos.forEach(turno => {

                    if (((turno.estado === 'asignado' && this.agendaAReasignar.estado === 'suspendida') || turno.estado === 'suspendido') && turno.paciente && turno.paciente.id) {

                        let params = {
                            idAgenda: this.agendaAReasignar.id,
                            idBloque: bloque.id,
                            idTurno: turno.id,
                            duracion: true,
                            horario: true
                        };

                        // 1. Ya reasignado: Trae agenda a la que re reasignó
                        if (turno.reasignado && turno.reasignado.siguiente) {
                            this.serviceAgenda.getById(turno.reasignado.siguiente.idAgenda).subscribe(agenda => {
                                this.agendasReasignar = [... this.agendasReasignar, { turno: turno, bloque: bloque, agendas: [agenda] }];
                                this.agendasReasignar.sort(sortCandidatas);
                            });
                        } else {
                            // 2. No reasignado: Trae agendas candidatas
                            this.serviceAgenda.findCandidatas(params).subscribe((agendas) => {
                                this.agendasReasignar = [... this.agendasReasignar, { turno: turno, bloque: bloque, agendas: agendas }];
                                this.agendasReasignar.sort(sortCandidatas);
                                this.calculosSimilitud(turno, agendas);
                            });

                        }

                    }

                });
            });
        }
    }

    interseccion(array1: any[], array2: any[]) {

        for (let i = 0; i < array1.length; i++) {
            let prof1 = array1[i];
            if (array2.find(x => String(x._id) === String(prof1._id))) {
                return true;
            }
        }

    }

    calculosSimilitud(turno: ITurno, agendas: any[]) {

        let calculos = 0;
        agendas.forEach((ag, iAgenda) => {
            let agendaReasignada = null;
            ag.bloques.forEach((bl, iBloque) => {
                let turnosFiltrados = bl.turnos;
                bl.turnos.forEach((tu) => {
                    let calculoSimilitud = {
                        tipoPrestacion: bl.tipoPrestaciones.findIndex(x => x._id === turno.tipoPrestacion.id) >= 0 ? 30 : 0,
                        horaInicio: 20,
                        duracionTurno: (this.agendaAReasignar.bloques.find(x => x.duracionTurno === bl.duracionTurno) ? 20 : 0),
                        profesional: ag.profesionales && this.interseccion(ag.profesionales, this.agendaAReasignar.profesionales) === true ? 30 : 0
                    };
                    calculos = (calculoSimilitud.tipoPrestacion + calculoSimilitud.horaInicio + calculoSimilitud.duracionTurno + calculoSimilitud.profesional);
                    if (turno.reasignado !== undefined && turno.reasignado.siguiente && turno.reasignado.siguiente.idTurno === tu._id) {
                        this.serviceAgenda.getById(turno.reasignado.siguiente.idAgenda).subscribe(reasignado => {

                            if (!agendaReasignada) {

                                ag.agendaReasignada = reasignado;
                                let indiceBloque = (reasignado as any).bloques.findIndex(x => x._id === bl._id);
                                ag.bloqueReasignado = reasignado.bloques[indiceBloque];
                                let indiceTurno = ag.bloqueReasignado.turnos.findIndex(x => x._id === tu._id);
                                ag.turnoReasignado = reasignado.bloques[indiceBloque].turnos[indiceTurno];
                            }
                        });

                    }
                });
            });
            ag.similitud = calculos;
        });

    }

    seleccionarCandidata(indiceTurno, i, horaDestino) {
        let turno = this.agendasReasignar[indiceTurno].turno;
        let bloque = this.agendasReasignar[indiceTurno].bloque;
        let agendaSeleccionada = this.agendasReasignar[indiceTurno].agendas[i];
        let tipoTurno;

        // Si la agenda es del día
        if (this.getFecha(horaDestino) === this.getFecha(this.hoy)) {
            tipoTurno = 'delDia';
            // Si no es del dia, chequeo el estado para definir el tipo de turno
        } else {
            // if (agendaSeleccionada.estado === 'disponible') {
            //     tipoTurno = 'gestion';
            // }

            if (agendaSeleccionada.estado === 'publicada') {
                tipoTurno = 'programado';
            }
        }
        let indiceBloque = agendaSeleccionada.bloques.findIndex(b => b.duracionTurno === bloque.duracionTurno);
        let indTurno = agendaSeleccionada.bloques[indiceBloque].turnos.findIndex(t => moment(t.horaInicio).format('HH:mm') === moment(turno.horaInicio).format('HH:mm'));

        let datosTurno = {
            idAgenda: agendaSeleccionada._id,
            idTurno: agendaSeleccionada.bloques[indiceBloque].turnos[indTurno]._id,
            idBloque: agendaSeleccionada.bloques[indiceBloque]._id,
            paciente: turno.paciente,
            tipoPrestacion: turno.tipoPrestacion,
            tipoTurno: tipoTurno,
            reasignado: {
                anterior: {
                    idAgenda: this.agendaAReasignar.id,
                    idBloque: bloque.id,
                    idTurno: turno.id
                }
            }
        };

        this.plex.confirm('Del ' + moment(turno.horaInicio).format('dddd DD/MM/YYYY') + ' al ' + moment(agendaSeleccionada.horaInicio).format('dddd DD/MM/YYYY') + ' a las ' + moment(turno.horaInicio).format('HH:mm [hs]'), '¿Reasignar Turno?').then((confirmado) => {
            if (!confirmado) {
                return false;
            }

            let operacion: Observable<any>;
            operacion = this.serviceTurno.save(datosTurno);
            operacion.subscribe(resultado => {
                // TODO: hacer un PUT con el id de la agenda en el campo turno.reasignado de la agenda original
                let turnoReasignado = turno;
                let siguiente = {
                    idAgenda: agendaSeleccionada._id,
                    idBloque: agendaSeleccionada.bloques[indiceBloque]._id,
                    idTurno: agendaSeleccionada.bloques[indiceBloque].turnos[indTurno]._id
                };

                if (turnoReasignado.reasignado) {
                    turnoReasignado.reasignado.siguiente = siguiente;
                } else {
                    turnoReasignado.reasignado = {
                        siguiente: siguiente
                    };
                };

                let reasignacion = {
                    idAgenda: this.agendaAReasignar.id,
                    idTurno: turno.id,
                    idBloque: bloque.id,
                    turno: turnoReasignado,
                };

                this.serviceTurno.put(reasignacion).subscribe(resultado2 => {
                    this.plex.toast('success', 'El turno se reasignó correctamente');
                    // Se envían SMS sólo en Producción
                    this.actualizar();
                    if (environment.production === true) {
                        let dia = moment(turnoReasignado.horaInicio).format('DD/MM/YYYY');
                        let horario = moment(turnoReasignado.horaInicio).format('HH:mm');
                        let mensaje = 'Le informamos que su turno fue reasignado al ' + dia + ' a las ' + horario + '.';
                        this.enviarSMS(turnoReasignado.paciente, mensaje);
                    } else {
                        this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
                    }
                });

            });
        });

    }

    enviarSMS(paciente: any, mensaje) {
        let smsParams = {
            telefono: paciente.telefono,
            mensaje: mensaje,
        };
        this.smsService.enviarSms(smsParams).subscribe(
            sms => {
                this.resultado = sms;

                // "if 0 errores"
                if (this.resultado === '0') {
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

    ocultarAgendaCandidata(idAgenda, indice) {

        if (this.agendasOcultas.indexOf(idAgenda) > -1) {
            delete this.agendasOcultas[indice];
        } else {
            this.agendasOcultas[indice] = idAgenda;
        }
        this.agendasOcultas = [... this.agendasOcultas];

    }

    reasignarTurnos() {
        this.reasignarTurnosEmit.emit(this.agendaAReasignar);
    }

    getHora(fecha) {
        return moment(fecha).format('HH:mm');
    }

    getFecha(fecha) {
        return moment(fecha).format('DD/MM/YYYY');
    }


    /**
     * Accordion
     */

    togglePanel(idTurno, indice) {
        if (this.paneles.indexOf(idTurno) > -1) {
            delete this.paneles[indice];
        } else {
            this.paneles[indice] = idTurno;
        }

        this.paneles = [... this.paneles];
    }

    // cancelar() {
    //     this.cancelaSuspenderTurno.emit(true);
    //     this.turnoAReasignar = null;
    // }

    // cerrar() {
    //     // this.saveSuspenderTurno.emit(this.agenda);
    // }

}
