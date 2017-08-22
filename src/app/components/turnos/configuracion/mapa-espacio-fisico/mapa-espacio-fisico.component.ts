import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';

import * as moment from 'moment';

@Component({
    selector: 'mapa-espacio-fisico',
    templateUrl: 'mapa-espacio-fisico.html',
    styleUrls: ['mapa-espacio-fisico.scss']
})
export class MapaEspacioFisicoComponent implements OnInit, OnChanges {
    @Input() espacioTable: IEspacioFisico[] = [];
    @Input() opciones: any;
    @Input() agendaSeleccionada: IAgenda = null;

    @Output() onEspacioClick = new EventEmitter<IEspacioFisico>();

    @Input() agendasTable: IAgenda[] = null;

    private start: any;
    private end: any;
    private unit: String;

    private _start: any;
    private _end: any;
    private _unit: any;

    private headers = [];
    private matrix: any;

    constructor(
        public plex: Plex,
        public servicioAgenda: AgendaService) { }


    ngOnInit() {
        this.refreshScreen();
    }

    ngOnChanges() {
        this.refreshScreen();
    }

    aproximar(date, cotaInferior) {
        let m = date.get('minutes');
        let remaider = m % this._unit;
        if (remaider !== 0) {
            if (cotaInferior) {
                date.subtract(remaider, 'minutes');
            } else {
                date.add(this._unit - remaider, 'minutes');
            }
        }
        return date;
    }

    refreshScreen() {
        if (!this.opciones) {
            this.start = moment(this.agendaSeleccionada.horaInicio).startOf('hour').set('hour', 7);
            this.end = moment(this.agendaSeleccionada.horaFin).startOf('hour').set('hour', 20);
            this.unit = '10';
        } else {
            this.start = moment(this.opciones.start);
            this.end = moment(this.opciones.end);
            this.unit = this.unit;
        }
        if (this.unit !== 'day') {
            this._unit = Number(this.unit);
        }
        this.servicioAgenda.get({ fechaDesde: this.start, fechaHasta: this.end }).subscribe((agendas) => {
            this.agendasTable = agendas;
            this.calcHeaders();
            this.calcRows();
            this.calcItems();
        });
    }


    calcItems() {
        this.agendasTable.forEach(agenda => {
            let start_time = moment(agenda.horaInicio);
            let end_time = moment(agenda.horaFin);
            if (start_time >= this._start && end_time <= this._end) {
                if (agenda.espacioFisico) {
                    let _id = agenda.espacioFisico.id;
                    let temp = this.matrix.find(item => item.id === _id);
                    if (temp) {
                        temp.items.push({
                            id: agenda.id,
                            titulo: agenda.tipoPrestaciones[0].term,
                            descripcion: agenda.profesionales.length ? agenda.profesionales[0].nombre : '',
                            start: this.aproximar(start_time, false),
                            end: this.aproximar(end_time, true)
                        });
                    }
                }
            }
        });

        this.matrix.forEach(espacio => {
            espacio.items.sort((a, b) => a.start.diff(b.start));

            let temp = this._start.clone();
            espacio.items.forEach(item => {

                this.iterarLibres(espacio._items, temp, item.start);

                item.colspan = this.calcFrame(item.start, item.end);
                espacio._items.push(item);

                temp = item.end.clone();
            });
            this.iterarLibres(espacio._items, temp, this._end);

        });
    }

    iterarLibres(items, start, end) {
        let ini = this.aproximar(moment(this.agendaSeleccionada.horaInicio), false);
        let fin = this.aproximar(moment(this.agendaSeleccionada.horaFin), true);
        let span = this.calcFrame(start, end);
        let unit = parseInt(this.unit.toString(), 0);
        for (let i = 0; i < span; i++) {
            let it: any = {
                colspan: 1,
                time: start.clone().add(unit * i, 'minutes')
            };
            it.disponible = it.time >= ini && it.time.add(unit, 'minutes') <= fin;
            items.push(it);
        }
    }

    calcRows() {
        let matrix = [];
        if (this.espacioTable) {
            this.espacioTable.forEach(espacio => {
                matrix.push({
                    id: espacio.id,
                    nombre: espacio.nombre,
                    servicio: espacio.servicio,
                    sector: espacio.sector,
                    edificio: espacio.edificio,
                    _items: [],
                    items: []
                });
            });
        }
        this.matrix = matrix;
    }



    calcHeaders() {
        let headers = [];
        this._start = moment(this.start);
        this._end = moment(this.end);
        let temp;
        switch (this.unit) {
            case 'day':
                this._start.startOf('day');
                this._end.endOf('day');
                temp = this._start.clone();
                while (temp < this._end) {
                    headers.push({ date: temp, text: this._start.format('DD'), colspan: 1 });
                    temp = temp.add(1, 'days');
                }
                break;
            default:
                this._start.startOf('hour');
                this._end.endOf('hour');
                temp = this._start.clone();
                while (temp < this._end) {
                    headers.push({ date: temp, text: temp.format('HH:mm'), colspan: 60 / this._unit });
                    temp = temp.add(1, 'hour');
                    // temp = temp.add(unit, 'minutes');
                }
                break;
        }


        this.headers = headers;

    }


    calcFrame(start, end) {
        switch (this.unit) {
            case 'day':
                return 1;
            case 'hour':
                let _start = start.startOf('hour');
                let _end = end.endOf('hour');
                return _end.diff(_start, 'hours');
            default:
                let unit = parseInt(this.unit.toString(), 0);
                return (end.diff(start) / 60000) / unit;
        }
    }

    onClick(espacio) {
        this.onEspacioClick.emit(this.espacioTable.find(item => item.id === espacio.id));
    }




}
