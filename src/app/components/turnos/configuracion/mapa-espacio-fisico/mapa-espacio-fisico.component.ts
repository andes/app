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

    @Input() agendasTable: IAgenda[] = [];

    private start: any;
    private end: any;
    private unit: String;

    private _start: any;
    private _end: any;
    private _unit: any;

    private headers = [];
    private matrix: any;
    private agendaCache: IAgenda = null;
    constructor(
        public plex: Plex,
        public servicioAgenda: AgendaService) { }


    ngOnInit() {
        this.refreshScreen();
    }

    ngOnChanges(changes) {
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
            this.unit = '15';
        } else {
            this.start = moment(this.opciones.start);
            this.end = moment(this.opciones.end);
            this.unit = this.unit;
        }
        if (this.unit !== 'day') {
            this._unit = Number(this.unit);
        }
        if (this.agendaCache === null || moment(this.agendaCache.horaInicio).startOf('day').format() !== moment(this.agendaSeleccionada.horaInicio).startOf('day').format()) {
            this.servicioAgenda.get({ fechaDesde: this.start, fechaHasta: this.end }).subscribe((agendas) => {
                this.agendasTable = agendas;
                this.calcHeaders();
                this.generarTabla();
            });
            this.agendaCache = this.agendaSeleccionada;
        } else {
            this.calcHeaders();
            this.generarTabla();
        }
    }


    generarTabla() {
        let matrix = [];
        if (this.espacioTable) {
            this.espacioTable.forEach(espacio => {
                matrix.push({
                    id: espacio.id,
                    _value: espacio,
                    _items: [],
                    items: []
                });
            });
        };

        this.agendasTable.forEach(agenda => {
            let start_time = moment(agenda.horaInicio);
            let end_time = moment(agenda.horaFin);
            if (start_time >= this._start && end_time <= this._end) {
                if (agenda.espacioFisico) {
                    let _id = agenda.espacioFisico.id;
                    let temp = matrix.find(item => item.id === _id);
                    if (temp) {
                        temp.items.push({
                            id: agenda.id,
                            espacioID: _id,
                            titulo: agenda.tipoPrestaciones[0].term,
                            descripcion: agenda.profesionales.length ? agenda.profesionales[0].nombre : '',
                            start: this.aproximar(start_time, false),
                            end: this.aproximar(end_time, true),
                            _value: agenda
                        });
                    }
                }
            }
        });

        matrix.forEach(espacio => {
            espacio.items.sort((a, b) => a.start.diff(b.start));

            let temp = this._start.clone();
            espacio.items.forEach(item => {
                espacio._items.push(...this.iterarLibres(temp, item.start));
                item.colspan = this.calcFrame(item.start, item.end);
                espacio._items.push(item);

                temp = item.end.clone();
            });
            espacio._items.push(...this.iterarLibres(temp, this._end));

        });
        this.matrix = matrix;
    };

    iterarLibres(start, end) {
        let items = [];
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
        return items;
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

    onRowClick(espacio) {
        let item = this.makeItem(this.agendaSeleccionada, espacio.id);
        let index = this.check(item, espacio);
        if (index >= 0) {
            if (this.agendaSeleccionada.espacioFisico) {
                this.removeItem({ id: this.agendaSeleccionada.id, espacioID: this.agendaSeleccionada.espacioFisico.id });
            }
            this.addItem(index, item, espacio);
            this.onEspacioClick.emit(this.espacioTable.find(_item => _item.id === espacio.id));
        } else {
            this.plex.toast('danger', 'El espacio físico esta ocupado.', '');
        }
    }

    onItemClick(agenda) {
        // this.removeItem(agenda);
    }


    makeItem(agenda, espacioID) {
        let start_time = moment(agenda.horaInicio);
        let end_time = moment(agenda.horaFin);
        let item = {
            id: agenda.id,
            espacioID: espacioID,
            titulo: agenda.tipoPrestaciones[0].term,
            descripcion: agenda.profesionales.length ? agenda.profesionales[0].nombre : '',
            _value: agenda,
            start: this.aproximar(start_time, false),
            end: this.aproximar(end_time, true)
        };

        let span = this.calcFrame(item.start, item.end);
        (item as any).colspan = span;
        return item;
    }

    check(item, espacio) {
        let index = espacio._items.findIndex(el => {
            return el.time >= item.start;
        });

        let count = 0;
        for (let i = 0; i < item.colspan && i + index < espacio._items.length; i++) {
            if (espacio._items[index + i].disponible) {
                count++;
            }
        }
        return item.colspan === count ? index : -1;
    }

    addItem(index, item, espacio) {
        let first = espacio._items.slice(0, index);
        let second = espacio._items.slice(index + item.colspan);

        espacio._items = [...first, item, ...second];
        this.matrix = [...this.matrix];
        this.agendaSeleccionada.espacioFisico = espacio._value;

        let _ag = this.agendasTable.find(i => i.id === item.id);
        if (_ag) {
            _ag.espacioFisico = espacio._value;
        }
    }

    removeItem(agenda: any, row?: any) {
        if (row) {
            let i = row._items.findIndex(item => item.id === agenda.id);
            if (i >= 0) {

                let item = row._items[i];

                // split array in two
                let first = row._items.slice(0, i);
                let second = row._items.slice(i + 1);

                let middle = this.iterarLibres(item.start, item.end);
                row._items = [...first, ...middle, ...second];
                this.matrix = [...this.matrix];


            }
        } else {
            let r = this.matrix.find(item => item.id === agenda.espacioID);
            if (r) {
                return this.removeItem(agenda, r);
            }
        }
    }


}
