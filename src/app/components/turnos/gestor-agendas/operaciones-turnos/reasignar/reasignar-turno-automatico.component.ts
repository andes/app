import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
// import { SmsService } from './../../../../../services/turnos/sms.service';
import * as moment from 'moment';

@Component({
    selector: 'reasignar-turno-automatico',
    templateUrl: 'reasignar-turno-automatico.html'
})

export class ReasignarTurnoAutomaticoComponent implements OnInit {
    agendasOcultas: any[] = [];

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

    agendasCandidatas: any[] = [];
    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    autorizado: any;

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:reasignarTurnos:?').length > 0;
    }

    actualizar() {
        let sortCandidatas = function (a, b) {
            return a.turno.horaInicio - b.turno.horaInicio;
        };
        this.agendasCandidatas = [];
        if (this.agendaAReasignar) {
            this.agendaAReasignar.bloques.forEach(bloque => {
                bloque.turnos.forEach(turno => {
                    if (turno.paciente) {

                        let params = {
                            idAgenda: this.agendaAReasignar.id,
                            idBloque: bloque.id,
                            idTurno: turno.id,
                            duracion: true,
                            horario: true
                        };

                        this.serviceAgenda.findCandidatas(params).subscribe((agendas) => {
                            this.agendasCandidatas = [... this.agendasCandidatas, { turno: turno, bloque: bloque, agendas: agendas }];
                            this.agendasCandidatas.sort(sortCandidatas);
                            this.calculosSimilitud(turno, agendas);
                            console.log('agendasCandidatas', this.agendasCandidatas);
                        });
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
        agendas.forEach((ag) => {
            let agendaReasignada = null;
            ag.bloques.forEach((bl) => {
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

    seleccionarCandidata(indiceTurno, i) {
        let turno = this.agendasCandidatas[indiceTurno].turno;
        let bloque = this.agendasCandidatas[indiceTurno].bloque;
        let agendaSeleccionada = this.agendasCandidatas[indiceTurno].agendas[i];
        let tipoTurno;

        // Si la agenda es del día
        if (agendaSeleccionada >= moment().startOf('day').toDate() &&
            agendaSeleccionada.horaInicio <= moment().endOf('day').toDate()) {
            tipoTurno = 'delDia';
            // Si no es del dia, chequeo el estado para definir el tipo de turno
        } else {
            if (agendaSeleccionada.estado === 'disponible') {
                tipoTurno = 'gestion';
            }

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
        // console.log('datosTurno ', datosTurno);
        this.plex.confirm('¿Reasignar Turno?').then((confirmado) => {
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

    ocultarAgendaCandidata(idAgenda, indice) {

        if (this.agendasOcultas.indexOf(idAgenda) > -1) {
            this.agendasOcultas.splice(this.agendasOcultas.indexOf(idAgenda), 1);
        } else {
            this.agendasOcultas[indice] = idAgenda;
        }

        this.agendasOcultas = [... this.agendasOcultas];

    }

    estaOculta(idAgenda) {
        return this.agendasOcultas.find(id => id === idAgenda) > 0;
    }


    reasignarTurnos() {
        this.reasignarTurnosEmit.emit(this.agendaAReasignar);
    }

    // cancelar() {
    //     this.cancelaSuspenderTurno.emit(true);
    //     this.turnoAReasignar = null;
    // }

    // cerrar() {
    //     // this.saveSuspenderTurno.emit(this.agenda);
    // }

}
