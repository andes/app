import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CalendarioDia } from './calendario-dia.class';
import * as moment from 'moment';

@Component({
    selector: 'app-calendario',
    templateUrl: 'calendario.html',
})
export class CalendarioComponent {
    private _agenda: any;
    private _agendas: Array<any>;
    private _estado: String;
    private calendario: any = [];
    private diaSeleccionado: CalendarioDia;
    private finde: boolean;

    // Propiedades
    @Output('agendaChanged') agendaChanged = new EventEmitter();
    @Input('fecha') fecha: Date;
    @Input('agenda')
    set agenda(value: IAgenda) {
        this._agenda = value;
        if (value) {
            this.actualizar();
        }
    }
    get agenda(): IAgenda {
        return this._agenda;
    }

    @Input('agendas')
    set agendas(value: Array<IAgenda>) {
        this._agendas = value;
        this.actualizar();
    }
    get agendas(): Array<IAgenda> {
        return this._agendas;
    }

    @Input('estado')
    set estado(value: String) {
        this._estado = value;
    }
    get estado(): String {
        return this._estado;
    }

    /** Devuelve la primera agenda que encuentra de un día determinado */
    private agendaPorFecha(fecha: moment.Moment): IAgenda {
        // TODO: optimizar esta búsqueda
        return this.agendas.find(i => {
            return moment(fecha).isSame(i.horaInicio, 'day');
        });
    }

    /** Devuelve las agendas correspondientes a un día determinado */
    public agendasPorFecha(fecha: moment.Moment): IAgenda[] {
        let ags = this.agendas.filter(
            function (value) {
                return (moment(fecha).isSame(value.horaInicio, 'day'));
            }
        );
        return ags;
    }
    /** Regenera el calendario */
    private actualizar() {
        if (this.fecha && this.agendas) {
            let inicio = moment(this.fecha).startOf('month').startOf('week');
            this.diaSeleccionado = null;
            this.calendario = [];
            for (let r = 1; r <= 5; r++) {
                let week = [];
                this.calendario.push(week);
                for (let c = 1; c <= 7; c++) {
                    let ags = this.agendasPorFecha(inicio);
                    let ag = null;
                    if (ags.length > 1) {
                        ag = ags[0];
                        if (this.agenda) {
                            // Si hay una agenda seleccionada
                            let i = ags.indexOf(this.agenda);
                            if (i >= 0) {
                                ag = ags[i];
                            }
                        }
                    }
                    if (ags.length === 1) {
                        ag = this.agendaPorFecha(inicio);
                    }
                    let dia = new CalendarioDia(inicio.toDate(), ag);
                    dia.cantidadAgendas = ags.length;
                    dia.finde = inicio.isoWeekday() === 6 || inicio.isoWeekday() === 7 ? true : false;
                    week.push(dia);

                    // ¿Hay una agenda seleccionada?
                    if (dia.agenda && this.agenda && inicio.isSame(this.agenda.horaInicio, 'day')) {
                        dia.seleccionado = true;
                        this.diaSeleccionado = dia;
                    }
                    inicio.add(1, 'day');
                }
            }
        }
    }

    public seleccionar(dia: CalendarioDia) {
        // Sólo permite seleccionar días con agenda
        if (dia.agenda) {
            if (this.diaSeleccionado) {
                this.diaSeleccionado.seleccionado = false;
            }
            dia.seleccionado = true;
            this.diaSeleccionado = dia;
            this.agenda = dia.agenda;
            this.estado = 'seleccionada';
            this.agendaChanged.emit(dia.agenda);
        }
    }
}
