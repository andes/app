import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { CalendarioDia } from './calendario-dia.class';
import * as moment from 'moment';

@Component({
    selector: 'calendario',
    templateUrl: 'calendario.html',
})
export class CalendarioComponent {
    private _agenda: any;
    private _agendas: Array<any>;
    private _estado: String;
    private calendario: any = [];
    private diaSeleccionado: CalendarioDia;

    // Propiedades
    @Output('agenda-changed') onChange = new EventEmitter();
    @Input('fecha') fecha: Date;
    @Input('agenda')
    set agenda(value: IAgenda) {
        this._agenda = value;
        if (value){
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
            return moment(fecha).isSame(i.horaInicio, 'day')
        });
    }

    /** Devuelve las agendas correspondientes a un día determinado */
    public agendasPorFecha(fecha: moment.Moment): IAgenda[] {
        return this.agendas.filter(
            function (value) {
                return (moment(fecha).isSame(value.horaInicio, 'day'));
            }
        );
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
                    inicio.add(1, 'day');
                    let dia = new CalendarioDia(inicio.toDate(), this.agendaPorFecha(inicio));
                    week.push(dia);

                    // ¿Hay una agenda seleccionada?
                    if (dia.agenda && this.agenda && inicio.isSame(this.agenda.horaInicio, 'day')) {
                        dia.seleccionado = true;
                        this.diaSeleccionado = dia;
                    }
                }
            }
        }
    }

    public seleccionar(dia: CalendarioDia) {
        // Sólo permite seleccionar días con agenda
        if (dia.agenda) {
            if (this.diaSeleccionado){
                this.diaSeleccionado.seleccionado = false;
            }
            dia.seleccionado = true;
            this.diaSeleccionado = dia;
            // Selecciona la agenda
            this.agenda = dia.agenda;
            this.estado = 'seleccionada';
            this.onChange.emit(dia.agenda);
        }
    }
}
