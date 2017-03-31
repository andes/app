import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgendaService } from './../../services/turnos/agenda.service';
import * as moment from 'moment';
type Estado = 'noSeleccionado' | 'seleccionado'
@Component({
    selector: 'clonar-agenda',
    templateUrl: 'clonar-agenda.html'
})

export class ClonarAgendaComponent implements OnInit {
    private _agenda: any;
    public hoy: Date = new Date();
    private fecha: Date;
    private calendario: any = [];
    private estado: Estado = 'noSeleccionado';
    private seleccionados: any[] = [];
    private agendas: IAgenda[] = []; // Agendas del mes seleccionado
    private agendasFiltradas: any[] = []; // Las agendas que hay en el día, cuando se selecciona una fecha para clonar
    private inicioMesMoment: moment.Moment;
    private inicioMesDate;
    private finMesDate;
    private original: boolean = true;
    private inicioAgenda: Date;
    public danger = 'list-group-item-danger';
    
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }
    @Output() cancelaClonar = new EventEmitter<boolean>();

    ngOnInit() {
        this.inicioAgenda = new Date(this.agenda.horaInicio);
        this.inicioAgenda.setHours(0, 0, 0, 0);
        this.hoy.setHours(0, 0, 0, 0);
        this.fecha = this.inicioAgenda;
        this.actualizar();
    }

    private actualizar() {
        if (this.seleccionados.indexOf(this.inicioAgenda.getTime()) < 0) {
            this.seleccionados.push(this.inicioAgenda.getTime());
        }
        moment.locale('en');
        this.inicioMesMoment = moment(this.fecha).startOf('month').startOf('week');
        this.inicioMesDate = this.inicioMesMoment.toDate();
        this.finMesDate = (moment(this.fecha).endOf('month').endOf('week')).toDate();
        let params = {
            fechaDesde: this.inicioMesDate,
            fechaHasta: this.finMesDate,
            espacioFisico: this.agenda.espacioFisico.id
        };
        params['profesionales'] = JSON.stringify(this.agenda.profesionales.map(elem => { elem.id; return elem; }));
        this.serviceAgenda.get(params).subscribe(agendas => { this.agendas = agendas; });
        this.cargarCalendario();
    }

    private cargarCalendario() {
        let dia: any = {};
        this.calendario = [];

        for (let r = 1; r <= 5; r++) {
            let week = [];
            this.calendario.push(week);
            for (let c = 1; c <= 7; c++) {
                this.inicioMesMoment.add(1, 'day');
                this.inicioMesDate = this.inicioMesMoment.toDate();
                let indice = -1;
                if (this.seleccionados) {
                    indice = this.seleccionados.indexOf(this.inicioMesDate.getTime());
                }
                if (indice >= 0) {
                    if (indice === 0) {
                        dia = {
                            fecha: this.inicioMesMoment.toDate(),
                            estado: 'seleccionado',
                            original: true
                        };
                    } else {
                        dia = {
                            fecha: this.inicioMesMoment.toDate(),
                            estado: 'seleccionado',
                            original: false
                        };
                    }
                } else {
                    dia = {
                        fecha: this.inicioMesMoment.toDate(),
                        estado: this.estado,
                        original: false
                    };
                }
                week.push(dia);
            }
        }
    }

    public cambiarMes(signo) {
        if (signo === '+') {
            this.fecha = moment(this.fecha).add(1, 'M').toDate();
        } else {
            this.fecha = moment(this.fecha).subtract(1, 'M').toDate();
        }
        this.actualizar();
    }

    public seleccionar(dia: any) {
        if (dia.fecha.getTime() >= this.hoy.getTime()){
            let original = this.agenda;
            // Mostrar las agendas que coincidan con las prestaciones de la agenda seleccionada en ese dia
            if (dia.original) {
                this.original = true;
            } else {
                this.original = false;
            }
            if (dia.estado === 'noSeleccionado' && this.original !== true) {
                dia.estado = 'seleccionado';
                this.seleccionados.push(dia.fecha.getTime());
                let band = false;
                let originalIni = moment(original.horaInicio).format('HH:mm');
                let originalFin = moment(original.horaFin).format('HH:mm');
                this.agendasFiltradas = this.agendas.filter(
                    function (actual) {
                        let actualIni = moment(original.horaInicio).format('HH:mm');
                        let actualFin = moment(original.horaInicio).format('HH:mm');
                        band = moment(dia.fecha).isSame(moment(actual.horaInicio), 'day');
                        band = band &&
                            ((originalIni <= actualIni && actualIni <= originalFin)
                                || (originalIni <= actualFin && actualFin <= originalFin));
                        return band;
                    }
                );
            } else {
                this.agendasFiltradas = [];
                if (this.original !== true) {
                    dia.estado = 'noSeleccionado';
                    let i: number = this.seleccionados.indexOf(dia.fecha.getTime());
                    this.seleccionados.splice(i, 1);
                }
            }
            this.agendasFiltradas.forEach((agenda, index) => {
                if (agenda.profesionales.map(elem => { return elem.id; }).some
                (v => {return this.agenda.profesionales.map(elem => { return elem.id; }).includes(v); })) {
                    agenda.conflictoProfesional = 1;
                }

                if (agenda.espacioFisico.id === this.agenda.espacioFisico.id) {
                    agenda.conflictoEF = 1;
                }
            });
        }
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    public clonar() {
        let seleccionada = new Date(this.seleccionados[0]);
        let operaciones: Observable<IAgenda>[] = [];
        let operacion: Observable<IAgenda>;
        this.seleccionados.forEach((seleccion, index0) => {
            seleccionada = new Date(seleccion);
            if (seleccionada && index0 > 0) {
                let newHoraInicio = this.combinarFechas(seleccionada, new Date(this.agenda.horaInicio));
                let newHoraFin = this.combinarFechas(seleccionada, this.agenda.horaFin);
                this.agenda.horaInicio = newHoraInicio;
                this.agenda.horaFin = newHoraFin;
                let newIniBloque: any;
                let newFinBloque: any;
                let newIniTurno: any;
                this.agenda.bloques.forEach((bloque, index) => {
                    newIniBloque = this.combinarFechas(seleccionada, bloque.horaInicio);
                    newFinBloque = this.combinarFechas(seleccionada, bloque.horaFin);
                    bloque.horaInicio = newIniBloque;
                    bloque.horaFin = newFinBloque;
                    bloque.turnos.forEach((turno, index1) => {
                        newIniTurno = this.combinarFechas(seleccionada, turno.horaInicio);
                        turno.horaInicio = newIniTurno;
                        turno.estado = 'disponible';
                        turno.asistencia = false;
                        turno.paciente = null;
                        turno.tipoPrestacion = null;
                        turno.idPrestacionPaciente = null;

                    });
                });
                this.agenda.estado = 'Planificacion';
                delete this.agenda._id;
                delete this.agenda.id;
                operacion = this.serviceAgenda.save(this.agenda);
                operaciones.push(operacion);
            }
        });
        Observable.forkJoin(operaciones).subscribe(
            function (x) {
                console.log('Next: %s', x);
            },
            function (err) {
                console.log('Error: %s', err);
            },
            function () {
                console.log('Completed');
                alert('La agenda se clonó correctamente');
                // this.plex.alert('La agenda se clonó correctamente');
            }
        );
    }

    cancelar() {
        debugger;
        this.cancelaClonar.emit(true);
    }

    constructor(private serviceAgenda: AgendaService, public plex: Plex) { }
}
