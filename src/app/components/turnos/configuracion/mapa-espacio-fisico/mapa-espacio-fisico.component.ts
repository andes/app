import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { AgendaService } from './../../../../services/turnos/agenda.service';



@Component({
    selector: 'mapa-espacio-fisico',
    templateUrl: 'mapa-espacio-fisico.html',
    styleUrls: ['mapa-espacio-fisico.scss']
})
export class MapaEspacioFisicoComponent implements OnInit, OnChanges {
    @Input() espacioTable: IEspacioFisico[] = [];
    @Input() agendaSeleccionada: IAgenda = null;
    @Input() opciones: any;
    @Input() showBotonCancelar = false;
    @Input() fecha: Date;

    @Output() onEspacioClick = new EventEmitter<IEspacioFisico>();
    @Output() agendaVista = new EventEmitter<IAgenda>();
    @Output() onCancelEmit = new EventEmitter<boolean>();

    @Input() agendasTable: IAgenda[] = [];

    private start: any;
    private end: any;
    private unit: String = '15';

    private _start: any;
    private _end: any;
    private _unit: any;

    public headers = [];
    public matrix: any;
    private agendaCache: IAgenda = null;
    idInfoAgenda = '';

    constructor(
        public plex: Plex,
        public servicioAgenda: AgendaService,
        public auth: Auth,
        private router: Router) { }


    ngOnInit() {

        if (!this.auth.getPermissions('espaciosFisicos:?').length) {
            this.router.navigate(['inicio']);
        }

        if (this.agendaSeleccionada) {
            this.refreshScreen();
        } else {
            this.unit = '15';
            this.calcHeaders();
            this.generarTabla();
        }

        if (this.fecha) {
            this.start = moment(this.fecha.setHours(8, 0, 0, 0));
            this.end = moment(this.fecha.setHours(20, 0, 0, 0));
            this.unit = '15';
            this._start = moment(this.fecha.setHours(8, 0, 0, 0));
            this._end = moment(this.fecha.setHours(20, 0, 0, 0));
            this._unit = '15';
        }

    }

    ngOnChanges(changes) {
        if (this.agendaSeleccionada) {
            this.refreshScreen();
        } else {
            if (this.fecha) {
                this.start = moment(this.fecha.setHours(8, 0, 0, 0));
                this.end = moment(this.fecha.setHours(20, 0, 0, 0));
                this.unit = '15';
                this._start = moment(this.fecha.setHours(8, 0, 0, 0));
                this._end = moment(this.fecha.setHours(20, 0, 0, 0));
                this._unit = '15';
            }
            this.calcHeaders();
            this.generarTabla();
        }
    }

    aproximar(date, cotaInferior) {
        const m = date.get('minutes');
        const remaider = m % this._unit;
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

        if (typeof this.agendaSeleccionada.id === 'undefined') {
            this.agendaSeleccionada.id = '0'; // Para identificar que es una agenda nueva (en planificar-agenda)
        }

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
            const query = {
                fechaDesde: this.start.toDate(),
                fechaHasta: this.end.toDate(),
                organizacion: this.auth.organizacion.id
            };
            this.servicioAgenda.get(query).subscribe((agendas) => {
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
        const matrix = [];
        if (this.espacioTable) {
            this.espacioTable.forEach(espacio => {
                matrix.push({
                    id: espacio.id,
                    _value: espacio,
                    _items: [],
                    items: []
                });
            });
        }

        this.agendasTable.forEach(agenda => {
            const start_time = moment(agenda.horaInicio);
            const end_time = moment(agenda.horaFin);
            if (start_time >= this._start && end_time <= this._end) {
                if (agenda.espacioFisico && (agenda.estado === 'disponible' || agenda.estado === 'publicada' || agenda.estado === 'planificacion' || agenda.estado === 'pausada')) {
                    const _id = agenda.espacioFisico.id;
                    const temp = matrix.find(item => item.id === _id);
                    if (temp) {
                        temp.items.push({
                            id: agenda.id,
                            espacioID: _id,
                            horaInicio: agenda.horaInicio,
                            horaFin: agenda.horaFin,
                            prestaciones: agenda.tipoPrestaciones,
                            profesionales: agenda.profesionales || null,
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
    }

    iterarLibres(start, end) {

        const items = [];
        let ini = this._start;
        let fin = this._end;
        if (this.agendaSeleccionada) {
            ini = this.aproximar(moment(this.agendaSeleccionada.horaInicio), false);
            fin = this.aproximar(moment(this.agendaSeleccionada.horaFin), true);
        }
        const span = this.calcFrame(start, end);
        const unit = parseInt(this.unit.toString(), 10);
        for (let i = 0; i < span; i++) {
            const it: any = {
                colspan: 1,
                time: start.clone().add(unit * i, 'minutes')
            };
            it.disponible = it.time >= ini && it.time.add(unit, 'minutes') <= fin;
            items.push(it);
        }
        return items;

    }

    calcHeaders() {
        const headers = [];
        this._start = moment(this.start);
        this._end = moment(this.end);
        let temp;
        switch (this.unit) {
            case 'day':
                this._start.startOf('day');
                this._end.endOf('day');
                temp = this._start.clone();
                while (temp < this._end) {
                    headers.push({ date: temp, hora: this._start.format('DD'), colspan: 1 });
                    temp = temp.add(1, 'days');
                }
                break;
            default:
                this._start.startOf('hour');
                this._end.endOf('hour');
                temp = this._start.clone();
                while (temp < this._end) {
                    headers.push({ date: temp, hora: temp.format('HH:mm'), colspan: 60 / this._unit });
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
                const _start = start.startOf('hour');
                const _end = end.endOf('hour');
                return _end.diff(_start, 'hours');
            default:
                const unit = parseInt(this.unit.toString(), 10);
                return (end.diff(start) / 60000) / unit;
        }
    }

    seleccionarEspacio(espacio, agendaDisponible) {
        if (this.agendaSeleccionada) {
            if (agendaDisponible === true) {
                const item = this.makeItem(this.agendaSeleccionada, espacio.id);
                const index = this.espacioOcupado(item, espacio);
                if (index >= 0 || typeof this.agendaSeleccionada.id === 'undefined') {
                    this.plex.confirm('Asignar espacio físico ' + espacio._value.nombre, '¿Confirmar?').then((respuesta) => {
                        if (respuesta === true) {
                            if (this.agendaSeleccionada.espacioFisico) {
                                this.removeItem({ id: this.agendaSeleccionada.id, espacioID: this.agendaSeleccionada.espacioFisico.id });
                            }
                            this.addItem(index || 0, item, espacio);
                            this.onEspacioClick.emit(this.espacioTable.find(_item => _item.id === espacio.id));
                        } else {
                            return false;
                        }
                    });
                } else {
                    this.plex.toast('danger', 'El espacio físico esta ocupado.', '');
                }
            }
        }
    }

    makeItem(agenda, espacioID) {
        const start_time = moment(agenda.horaInicio);
        const end_time = moment(agenda.horaFin);
        const item = {
            id: agenda.id,
            espacioID: espacioID,
            horaInicio: agenda.horaInicio,
            horaFin: agenda.horaFin,
            prestaciones: agenda.tipoPrestaciones,
            descripcion: agenda.profesionales && agenda.profesionales[0] ? agenda.profesionales[0].nombre : '',
            _value: agenda,
            start: this.aproximar(start_time, false),
            end: this.aproximar(end_time, true)
        };

        const span = this.calcFrame(item.start, item.end);
        (item as any).colspan = span;
        return item;
    }

    espacioOcupado(item, espacio) {
        const index = espacio._items.findIndex(el => {
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
        const first = espacio._items.slice(0, index);
        const second = espacio._items.slice(index + item.colspan);

        espacio._items = [...first, item, ...second];
        this.matrix = [...this.matrix];
        this.agendaSeleccionada.espacioFisico = espacio._value;

        const _ag = this.agendasTable.find(i => i.id === item.id);
        if (_ag) {
            _ag.espacioFisico = espacio._value;
        }
    }

    removeItem(agenda: any, row?: any) {
        if (row) {
            const i = row._items.findIndex(item => item.id === agenda.id);
            if (i >= 0) {

                const item = row._items[i];

                // split array in two
                const first = row._items.slice(0, i);
                const second = row._items.slice(i + 1);

                const middle = this.iterarLibres(item.start, item.end);
                row._items = [...first, ...middle, ...second];
                this.matrix = [...this.matrix];


            }
        } else {
            const r = this.matrix.find(item => item.id === agenda.espacioID);
            if (r) {
                return this.removeItem(agenda, r);
            }
        }
    }

    showInfo(idAgenda: string) {
        if (idAgenda && idAgenda.length > 0) {
            this.idInfoAgenda = idAgenda;
        } else {
            this.idInfoAgenda = '0';
        }
    }

    cerrarMapa(event) {
        this.onCancelEmit.emit(true);
    }



    seleccionarAgenda(agenda) {
        this.agendaVista.emit(agenda._value);
    }

}
