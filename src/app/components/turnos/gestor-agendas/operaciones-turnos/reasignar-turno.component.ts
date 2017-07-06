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
    selector: 'reasignar-turno',
    templateUrl: 'reasignar-turno.html'
})

export class ReasignarTurnoComponent implements OnInit {
    showReasignarTurno: boolean;
    agendasSimilares: IAgenda[];

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
    @Output() reasignacionManualAgendasEmit = new EventEmitter<boolean>();

    public turnoAReasignar: ITurno;

    turnosAReasignar: any[] = [];
    turnosSeleccionados: any[] = [];

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    autorizado: any;

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
    }

    actualizar() {
        this.turnosAReasignar = [];
        if (this.agendaAReasignar) {
            this.agendaAReasignar.bloques.forEach(bloque => {
                bloque.turnos.forEach(turno => {
                    if (turno.paciente) {

                        let params = {
                            idAgenda: this.agendaAReasignar.id,
                            idBloque: bloque.id,
                            idTurno: turno.id
                        };

                        this.serviceTurno.get(params).subscribe((agendas) => {
                            this.turnosAReasignar = [... this.turnosAReasignar, { turno: turno, bloque: bloque, agendas: agendas }];
                            this.calculosSimilitud(turno, agendas);
                            // console.log('turnosAReasignar', this.turnosAReasignar);
                        });
                    }

                });
            });
        }
    }

    /**
     * 
     * @param array1 
     * @param array2 
     */
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
            ag.bloques.forEach((bl) => {
                bl.turnos.forEach((tu) => {
                    let calculoSimilitud = {
                        tipoPrestacion: bl.tipoPrestaciones.findIndex(x => x._id === turno.tipoPrestacion.id) >= 0 ? 30 : 0,
                        // horaInicio: (turno.horaInicio === tu.horaInicio ? 30 : 0),
                        horaInicio: 20,
                        duracionTurno: (this.agendaAReasignar.bloques.find(x => x.duracionTurno === bl.duracionTurno) ? 20 : 0),
                        profesional: this.interseccion(ag.profesionales, this.agendaAReasignar.profesionales) === true ? 30 : 0
                        // diaSemana: (moment(tu.horaInicio).weekday() === moment(ag.horaInicio).weekday() ? 10 : 0)
                    };
                    calculos = (calculoSimilitud.tipoPrestacion + calculoSimilitud.horaInicio + calculoSimilitud.duracionTurno + calculoSimilitud.profesional);
                });
            });
            ag.similitud = calculos;
        });

        // if (calculos > 0) {
        //     return calculos;
        // }

    }

    // estaSeleccionado(turno: any) {
    //     return this.turnosSeleccionados.indexOf(turno) >= 0;
    // }

    cargarturnosAReasignar(idAgendaAReasignar, idBloque, idTurno) {

        let params = {
            idAgenda: idAgendaAReasignar,
            idBloque: idBloque,
            idTurno: idTurno
        };

        this.serviceTurno.get(params).subscribe((agendas) => {

            let indice = this.turnosAReasignar.find(x => x.idTurno === idTurno);
            let candidatas = {
                idTurno: idTurno,
                agendas: agendas
            };
            this.turnosAReasignar = [... this.turnosAReasignar, candidatas];
        });
    }

    cargarAgendasSimilares(idAgendaAReasignar, idBloque, idTurno) {
        // let params = {
        //     fechaDesde: new Date(),
        //     estados: ['publicada', 'disponible']
        // };

        // this.serviceAgenda.get(params).subscribe((agendas) => {
        //     this.agendasSimilares = agendas;
        // });

        let params = {
            idAgenda: idAgendaAReasignar,
            idBloque: idBloque,
            idTurno: idTurno
        };

        this.serviceAgenda.findCandidatas(params).subscribe((agendas) => {
            this.agendasSimilares = agendas;
            console.log('agendasSimilares', this.agendasSimilares);
        });


    }

    seleccionarTurno(turno, bloque, multiple = false, sobreturno) {
        turno.sobreturno = sobreturno;

        if (!multiple) {
            this.turnosSeleccionados = [];
            this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
        } else {
            if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
                this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
                this.turnosSeleccionados = [... this.turnosSeleccionados];
            } else {
                this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
            }
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });

        this.cargarAgendasSimilares(this.agendaAReasignar.id, bloque.id, turno.id);

    }

    seleccionarCandidata(indiceTurno, i) {

        let turno = this.turnosAReasignar[indiceTurno].turno;
        let bloque = this.turnosAReasignar[indiceTurno].bloque;
        let agendaSeleccionada = this.turnosAReasignar[indiceTurno].agendas[i];
        let tipoTurno;

        console.log('seleccionarCandidata ', agendaSeleccionada);
        console.log('seleccionarCandidata ', this.turnosAReasignar[indiceTurno]);
        // Si la agenda es del día
        if (agendaSeleccionada >= moment().startOf('day').toDate() &&
            agendaSeleccionada.horaInicio <= moment().endOf('day').toDate()) {
            tipoTurno = 'delDia';
            // Si no es del día, chequeo el estado para definir el tipo de turno
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
            // reasignacion: this.agendaAReasignar.id
        };
        console.log('datosTurno ', datosTurno);
        this.plex.confirm('¿Reasignar Turno?').then((confirmado) => {
            if (!confirmado) {
                return false;
            }

            let operacion: Observable<any>;
            operacion = this.serviceTurno.save(datosTurno);
            operacion.subscribe(resultado => {
                // TODO: hacer un PUT con el id de la agenda en el campo turno.reasignado de la agenda original
                let turnoReasignado = turno;
                turnoReasignado.reasignado = agendaSeleccionada._id;
                let reasignacion = {
                    idAgenda: this.agendaAReasignar.id,
                    idTurno: turno.id,
                    idBloque: bloque.id,
                    turno: turnoReasignado,
                };
                console.log('reasignacion');

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

    reasignacionManualAgendas() {
        this.reasignacionManualAgendasEmit.emit(true);
    }

    volverAlgestor() {
        this.reasignacionManualAgendasEmit.emit(true);
    }

}
