import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { OrganizacionService } from './../../../../services/organizacion.service';

import * as moment from 'moment';

@Component({
    selector: 'mapa-espacio-fisico',
    templateUrl: 'mapa-espacio-fisico.html',
    styleUrls: ['mapa-espacio-fisico.scss']
})
export class MapaEspacioFisicoComponent implements OnInit, OnChanges {
    @Input() espacioTable: IEspacioFisico[] = [];
    @Input() agendasTable: IAgenda[] = [];

    @Input() start: Date;
    @Input() end: Date;
    @Input() unit: String;

    private _start: any;
    private _end: any;

    private headers = [];
    private matrix: any;

    constructor(
        public plex: Plex) { }

    ngOnInit() {
        this.calcHeaders();
        this.calcRows();
        this.calcItems();
    }

    ngOnChanges(a) {
        this.calcHeaders();
        this.calcRows();
        this.calcItems();
    }

    calcItems() {
        this.agendasTable.forEach(agenda => {
            if (agenda.espacioFisico) {
                let _id = agenda.espacioFisico.id;
                let temp = this.matrix.find(item => item.id === _id);
                if (temp) {
                    temp.items.push({
                        id: agenda.id,
                        start: moment(agenda.horaInicio),
                        end: moment(agenda.horaFin)
                    });
                }
            }
        });

        this.matrix.forEach(espacio => {
            espacio.items.sort((a, b) => a.start.diff(b.start));

            let temp = this._start.clone();
            espacio.items.forEach(item => {
                let span = this.calcFrame(temp, item.start);
                for (let i = 0; i < span; i++) {
                    espacio._items.push({
                        colspan: 1
                    });
                }

                item.colspan = this.calcFrame(item.start, item.end);
                espacio._items.push(item);

                temp = item.end.clone();
            });

            let span = this.calcFrame(temp, this._end);
            for (let i = 0; i < span + 1; i++) {
                espacio._items.push({
                    colspan: 1
                });
            }

        });
    }

    calcRows() {
        this.matrix = [];
        if (this.espacioTable) {
            this.espacioTable.forEach(espacio => {
                this.matrix.push({
                    id: espacio.id,
                    name: espacio.nombre,
                    _items: [],
                    items: []
                });
            });
        }
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

    calcHeaders() {
        this.headers = [];
        this._start = moment(this.start);
        this._end = moment(this.end);
        this.headers.push({ colspan: 1, text: 'Espacios físicos' });
        let temp;
        switch (this.unit) {
            case 'day':
                this._start = this._start.startOf('day');
                this._end = this._end.endOf('day');
                temp = this._start.clone();
                while (temp < this._end) {
                    this.headers.push({ date: temp, text: this._start.format('DD'), colspan: 1 });
                    temp = temp.add(1, 'days');
                }
                break;
            case 'hour':
                this._start = this._start.startOf('hour');
                this._end = this._end.endOf('hour');
                temp = this._start.clone();
                while (temp < this._end) {
                    this.headers.push({ date: temp, text: temp.format('HH:mm'), colspan: 1 });
                    temp = temp.add(1, 'hour');
                }
                break;
            default:
                let unit = parseInt(this.unit.toString(), 0);
                this._start = this._start.startOf('hour');
                this._end = this._end.endOf('hour');
                temp = this._start.clone();
                while (temp < this._end) {
                    this.headers.push({ date: temp, text: temp.format('HH:mm'), colspan: 60 / unit });
                    temp = temp.add(1, 'hour');
                    // temp = temp.add(unit, 'minutes');
                }
                break;
        }

    }





}
