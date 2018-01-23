import { Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import * as moment from 'moment';
type Estado = 'noSeleccionado' | 'seleccionado';
@Component({
    selector: 'clonar-agenda',
    templateUrl: 'clonar-agenda.html',
    styleUrls: ['./../../dar-turnos/calendario.scss']
})

export class ClonarAgendaComponent implements OnInit {
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }
    @Output() volverAlGestor = new EventEmitter<boolean>();
    @HostBinding('class.plex-layout') layout = true;
    public autorizado = false;
    public agendasFiltradas: any[] = []; // Las agendas que hay en el día seleccionado para clonar
    public today = new Date();
    public fecha: Date;
    public calendario: any = [];
    private _agenda: any;
    private estado: Estado = 'noSeleccionado';
    private seleccionados: any[] = [];
    private agendas: IAgenda[] = []; // Agendas del mes seleccionado
    private inicioMesMoment: moment.Moment;
    private inicioMesDate;
    private finMesDate;
    private original = true;
    private inicioAgenda: Date;

    constructor(private serviceAgenda: AgendaService, public plex: Plex, public auth: Auth, private router: Router, ) { }
    ngOnInit() {
        moment.locale('en');
        this.autorizado = this.auth.check('turnos:clonarAgenda');
        if (!this.autorizado) {
            this.redirect('incio');
        } else {
            this.inicioAgenda = new Date(this.agenda.horaInicio);
            this.inicioAgenda.setHours(0, 0, 0, 0);
            this.today.setHours(0, 0, 0, 0);
            this.fecha = this.inicioAgenda;
            this.actualizar();
        }
    }

    private actualizar() {
        if (this.seleccionados.indexOf(this.inicioAgenda.getTime()) < 0) {
            this.seleccionados.push(this.inicioAgenda.getTime());
        }
        this.inicioMesMoment = moment(this.fecha).startOf('month').startOf('week');
        this.inicioMesDate = this.inicioMesMoment.toDate();
        this.finMesDate = (moment(this.fecha).endOf('month').endOf('week')).toDate();
        let params = {
            fechaDesde: this.today,
            fechaHasta: this.finMesDate,
            organizacion: this.auth.organizacion.id
        };
        this.serviceAgenda.get(params).subscribe(agendas => {
            this.agendas = agendas;
        });
        this.cargarCalendario();
    }

    private cargarCalendario() {
        let dia: any = {};
        this.calendario = [];
        let cantidadSemanas = Math.ceil(moment(this.fecha).endOf('month').endOf('week').diff(moment(this.fecha).startOf('month').startOf('week'), 'weeks', true));

        for (let r = 1; r <= cantidadSemanas; r++) {
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
                dia.weekend = this.inicioMesMoment.isoWeekday() === 6 || this.inicioMesMoment.isoWeekday() === 7 ? true : false;
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

    /**
     * Función disparada al picar sobre un dia del calendario.
     *
     * @param {*} dia
     * @memberof ClonarAgendaComponent
     */
    public seleccionar(dia: any) {
        let mismoDia = (moment(dia.fecha).isSame(moment(this.agenda.horaInicio), 'day'));
        if (dia.fecha.getTime() >= this.today.getTime() && !mismoDia) {
            let original = this.agenda;
            if (dia.original) {
                this.original = true;
            } else {
                this.original = false;
            }
            let band = false;
            let originalIni = moment(original.horaInicio).format('HH:mm');
            let originalFin = moment(original.horaFin).format('HH:mm');
            // Filtramos las agendas del mes que coinciden con el dia y horario en el que se intenta clonar
            let filtro = this.agendas.filter(
                function (actual) {
                    let actualIni = moment(actual.horaInicio).format('HH:mm');
                    let actualFin = moment(actual.horaFin).format('HH:mm');
                    band = actual.estado !== 'suspendida';
                    band = band && moment(dia.fecha).isSame(moment(actual.horaInicio), 'day');
                    band = band && ((originalIni <= actualIni && actualIni <= originalFin) || (originalIni <= actualFin && actualFin <= originalFin));
                    return band;
                }
            );
            if (dia.estado === 'noSeleccionado' && this.original !== true) {
                dia.estado = 'seleccionado';
                if (filtro.length === 0) {
                    this.seleccionados.push(dia.fecha.getTime());
                } else {
                    filtro.forEach((fil) => {
                        let aux = this.agendasFiltradas.map(elem => { return elem.id; });
                        if (aux.indexOf(fil.id) < 0) {
                            this.agendasFiltradas = this.agendasFiltradas.concat(fil);

                        }
                    });
                    this.verificarConflictos(dia);
                    if (dia.estado !== 'conflicto') {
                        this.seleccionados.push(dia.fecha.getTime());
                    }
                }
            } else {
                if (this.original !== true) {
                    if (dia.estado !== 'conflicto') { // Agendas en conflicto nunca llegan al array seleccionados
                        let i: number = this.seleccionados.indexOf(dia.fecha.getTime());
                        this.seleccionados.splice(i, 1);
                    }
                    dia.estado = 'noSeleccionado';
                    filtro.forEach((fil) => {
                        let aux = this.agendasFiltradas.map(elem => { return elem.id; });
                        let indice = aux.indexOf(fil.id);
                        if (indice >= 0) {
                            this.agendasFiltradas.splice(indice, 1);
                        }
                    });
                }
            }
        }
    }
    // Verifica si existen conflictos con las agendas existentes en ese dia
    /**
     * Para cada día seleccionado en el calendario, verifica entre las agendas filtradas
     * si existen agendas en él que provoquen conflictos al clonar.
     * 
     * @param {*} dia
     * @memberof ClonarAgendaComponent
     */
    verificarConflictos(dia: any) {
        this.agendasFiltradas = this.agendasFiltradas.filter((agenda) => {
            if (moment(dia.fecha).isSame(moment(agenda.horaInicio), 'day')) {
                if (agenda.profesionales.length > 0) {
                    if (agenda.profesionales.map(elem => { return elem.id; }).some
                        (v => { return this.agenda.profesionales.map(elem => { return elem.id; }).includes(v); })) {
                        agenda.conflictoProfesional = 1;
                        dia.estado = 'conflicto';
                    }
                }
                if (agenda.espacioFisico && this.agenda.espacioFisico) {
                    if (agenda.espacioFisico.id === this.agenda.espacioFisico.id) {
                        agenda.conflictoEF = 1;
                        dia.estado = 'conflicto';
                    }
                }
                let band = (agenda.conflictoEF === 1 || agenda.conflictoProfesional === 1) ? true : false;
                return band;
            } else {
                return true; // para no descartar las agendas ya existentes en la colección;
            }
        });

    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
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
        if (this.seleccionados.length > 1) { // >1 porque el primer elemento es la agenda original
            this.plex.confirm('¿Está seguro que desea realizar la clonación?').then(conf => {
                if (conf) {
                    this.seleccionados.splice(0, 1); // saco el primer elemento que es la agenda original
                    this.seleccionados = [...this.seleccionados];
                    let data = {
                        idAgenda: this.agenda.id,
                        clones: this.seleccionados
                    };
                    this.serviceAgenda.clonar(data).subscribe(resultado => {
                        this.plex.alert('La Agenda se clonó correctamente').then(ok => {
                            this.volverAlGestor.emit(true);
                        });
                    },
                        err => {
                            if (err) {
                                console.log(err);
                            }
                        });
                }
            }).catch(() => {
            });
        } else {
            this.plex.alert('', 'Seleccione al menos un día válido del calendario');
        }
    }

    cancelar() {
        this.volverAlGestor.emit(true);
    }
}
