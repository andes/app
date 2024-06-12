import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CalendarioDia } from './calendario-dia.class';
import * as moment from 'moment';
import { DataLayerManager } from '@agm/core';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'app-calendario',
    templateUrl: 'calendario.html',
    styleUrls: ['calendario.scss']
})
export class CalendarioComponent implements OnInit {
    mostrarFinesDeSemana: any;
    private _agenda: any;
    private _agendas: Array<any>;
    private diaSeleccionado: CalendarioDia;
    public calendario: any = [];

    @Input() opcionesCalendario: boolean;
    @Input() mostrarNoDisponibles: boolean;

    // Propiedades
    @Input() fecha: Date;
    @Input() _solicitudPrestacion: any;
    @Input() tipoTurno: string;

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

    @Input() estado: string;

    @Input() filtroPrestacion: any;

    @Input() filtroProfesional: any;


    @Output() agendaChanged = new EventEmitter();

    ngOnInit() {
        moment.updateLocale('es', {
            week: {
                dow: 1,
                doy: 1
            },
        });
    }

    /** Devuelve las agendas correspondientes a un día determinado */
    public agendasPorFecha(fecha: moment.Moment): IAgenda[] {
        const ags = this.agendas.filter((value) => {
            return (moment(fecha).isSame(moment(value.horaInicio), 'day'));
        });
        return ags;
    }


    /** Regenera el calendario */
    private actualizar() {

        if (this.fecha && this.agendas) {

            const inicio = moment(this.fecha).startOf('month').startOf('week');
            const ultimoDiaMes = moment(this.fecha).endOf('month');
            const primerDiaMes = moment(this.fecha).startOf('month');
            const cantidadSemanas = Math.ceil(moment(this.fecha).endOf('month').endOf('week').diff(moment(this.fecha).startOf('month').startOf('week'), 'weeks', true));
            this.diaSeleccionado = null;
            this.calendario = [];

            for (let r = 1; r <= cantidadSemanas; r++) {
                const week = [];
                this.calendario.push(week);

                for (let c = 1; c <= 7; c++) {

                    const agendasPorFecha = this.agendasPorFecha(inicio);
                    const ag = null;
                    const dia = new CalendarioDia(inicio.toDate(), agendasPorFecha, this._solicitudPrestacion, this.tipoTurno, this.filtroPrestacion, this.filtroProfesional);

                    if (dia.estado === 'vacio') {
                        //   dia.cantidadAgendas = 0;
                        dia.estado = 'vacio';
                        dia.agenda = null;
                    }

                    dia.weekend = inicio.isoWeekday() >= 6;
                    const isThisMonth = inicio.isSameOrBefore(ultimoDiaMes) && inicio.isSameOrAfter(primerDiaMes);
                    if (isThisMonth) {
                        week.push(dia);
                    } else {
                        week.push({ estado: 'vacio' });
                    }

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
        if (dia && dia.agenda) {
            if (this.diaSeleccionado) {
                this.diaSeleccionado.seleccionado = false;
            }
            dia.seleccionado = true;
            this.diaSeleccionado = dia;
            this.agenda = dia.agenda;
            this.estado = 'seleccionada';
            this.agendaChanged.emit(dia.agendasDisponibles.length ? dia.agendasDisponibles : [dia.agenda]);
        }
    }

    agendaDinamicaFutura(dia) {
        return (dia.dinamicasIndefinidas > 0 && moment(dia.fecha).isAfter(moment(), 'day'));
    }

    mostrarCloseIcon(dia) {
        return dia.turnosDisponibles === 0 && dia.dinamicasIndefinidas === 0 || dia.turnosDisponibles === 0 && this.agendaDinamicaFutura(dia);
    }

    outLineDanger(dia) {
        return (dia.estado === 'ocupado' || dia.turnosDisponibles === 0 && this.agendaDinamicaFutura(dia)) && !dia.seleccionado && this.mostrarNoDisponibles;
    }

}
