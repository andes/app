import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CalendarioDia } from './calendario-dia.class';
import * as moment from 'moment';

@Component({
    selector: 'app-calendario',
    templateUrl: 'calendario.html',
    styleUrls: ['calendario.scss']
})
export class CalendarioComponent {
    private _agenda: any;
    private _agendas: Array<any>;
    private _estado: String;
    private diaSeleccionado: CalendarioDia;
    public calendario: any = [];
    // Propiedades
    @Input('fecha') fecha: Date;
    @Input() _solicitudPrestacion: any;
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
    @Output('agendaChanged') agendaChanged = new EventEmitter();

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
        console.log(this._solicitudPrestacion);
        if (this.fecha && this.agendas) {
            let inicio = moment(this.fecha).startOf('month').startOf('week');
            let cantidadSemanas = Math.ceil(moment(this.fecha).endOf('month').endOf('week').diff(moment(this.fecha).startOf('month').startOf('week'), 'weeks', true));
            this.diaSeleccionado = null;
            this.calendario = [];
            for (let r = 1; r <= cantidadSemanas; r++) {
                let week = [];
                this.calendario.push(week);

                for (let c = 1; c <= 7; c++) {
                    let agendasPorFecha = this.agendasPorFecha(inicio);
                    let ag = null;

                    if (agendasPorFecha.length > 1) {

                        ag = agendasPorFecha[0];

                        if (this.agenda) {
                            // Si hay una agenda seleccionada
                            let i = agendasPorFecha.indexOf(this.agenda);
                            if (i >= 0) {
                                ag = agendasPorFecha[i];
                            }
                        }
                    }

                    if (agendasPorFecha.length === 1) {
                        ag = this.agendaPorFecha(inicio);
                    }

                    let dia = new CalendarioDia(inicio.toDate(), ag, this._solicitudPrestacion);
                    if (dia.estado === 'vacio' && this._solicitudPrestacion) {
                    // if ((dia.estado === 'vacio' || dia.estadoAgenda === 'publicada') && this._solicitudPrestacion) {
                        dia.cantidadAgendas = 0;
                        dia.estado = 'vacio';
                        dia.agenda = null;
                    } else {
                        dia.cantidadAgendas = agendasPorFecha.length;
                    }
                    dia.weekend = inicio.isoWeekday() >= 6;
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
