import { Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { AgendaService } from './../../services/turnos/agenda.service';
import * as moment from 'moment';
type Estado = 'noSeleccionado' | 'seleccionado';
@Component({
    selector: 'clonar-agenda',
    templateUrl: 'clonar-agenda.html'
})

export class ClonarAgendaComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    private _agenda: any;
    public autorizado = false;
    public hoy: Date = new Date();
    private fecha: Date;
    private calendario: any = [];
    private estado: Estado = 'noSeleccionado';
    private seleccionados: any[] = [];
    private agendas: IAgenda[] = []; // Agendas del mes seleccionado
    private agendasFiltradas: any[] = []; // Las agendas que hay en el día,
    private inicioMesMoment: moment.Moment;
    private inicioMesDate;
    private finMesDate;
    private original = true;
    private inicioAgenda: Date;
    private finde: boolean;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }
    @Output() volverAlGestor = new EventEmitter<boolean>();

    constructor(private serviceAgenda: AgendaService, public plex: Plex, public auth: Auth, private router: Router, ) { }
    ngOnInit() {
        moment.locale('en');
        this.autorizado = this.auth.check('turnos:clonarAgenda');
        if (!this.autorizado) {
            this.redirect('incio');
        } else {
            this.inicioAgenda = new Date(this.agenda.horaInicio);
            this.inicioAgenda.setHours(0, 0, 0, 0);
            this.hoy.setHours(0, 0, 0, 0);
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
            fechaDesde: this.inicioAgenda,
            fechaHasta: this.finMesDate,
        };
        if (this.agenda.espacioFisico) {
            params['espacioFisico'] = this.agenda.espacioFisico.id;
        }
        if (this.agenda.profesionales) {
            params['profesionales'] = this.agenda.profesionales.map(elem => { return elem.id; });
        }
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
                dia.finde = this.inicioMesMoment.isoWeekday() === 6 || this.inicioMesMoment.isoWeekday() === 7 ? true : false;
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
        if (dia.fecha.getTime() >= this.hoy.getTime()) {
            let original = this.agenda;
            if (dia.original) {
                this.original = true;
            } else {
                this.original = false;
            }
            let band = false;
            let originalIni = moment(original.horaInicio).format('HH:mm');
            let originalFin = moment(original.horaFin).format('HH:mm');
            let filtro = this.agendas.filter(
                function (actual) {
                    let actualIni = moment(original.horaInicio).format('HH:mm');
                    let actualFin = moment(original.horaInicio).format('HH:mm');
                    band = actual.estado !== 'suspendida';
                    band = band && moment(dia.fecha).isSame(moment(actual.horaInicio), 'day');
                    band = band &&
                        ((originalIni <= actualIni && actualIni <= originalFin)
                            || (originalIni <= actualFin && actualFin <= originalFin));
                    return band;
                }
            );
            // Mostrar las agendas que coincidan con los profesionales de la agenda seleccionada en ese dia
            if (dia.estado === 'noSeleccionado' && this.original !== true) {
                dia.estado = 'seleccionado';
                this.seleccionados.push(dia.fecha.getTime());
                filtro.forEach((fil) => {
                    let aux = this.agendasFiltradas.map(elem => { return elem.id; });
                    if (aux.indexOf(fil.id) < 0) {
                        this.agendasFiltradas = this.agendasFiltradas.concat(fil);
                    }
                });
            } else {
                if (this.original !== true) {
                    dia.estado = 'noSeleccionado';
                    let i: number = this.seleccionados.indexOf(dia.fecha.getTime());
                    this.seleccionados.splice(i, 1);
                    filtro.forEach((fil) => {
                        let aux = this.agendasFiltradas.map(elem => { return elem.id });
                        console.log(aux);
                        let indice = aux.indexOf(fil.id);
                        if (indice >= 0) {
                            this.agendasFiltradas.splice(indice, 1);
                        }
                    });
                }
            }
            // Detectar el tipo de conflicto
            this.agendasFiltradas.forEach((agenda, index) => {
                if (agenda.profesionales.length > 0) {
                    console.log('profesionales', agenda.profesionales.length);
                    if (agenda.profesionales.map(elem => { return elem.id; }).some
                        (v => { return this.agenda.profesionales.map(elem => { return elem.id; }).includes(v); })) {
                        agenda.conflictoProfesional = 1;
                    }
                }
                if (agenda.espacioFisico) {
                    console.log('espacio');
                    if (agenda.espacioFisico.id === this.agenda.espacioFisico.id) {
                        agenda.conflictoEF = 1;
                    }
                }
                if (agenda.profesionales.length === 0 && !agenda.espacioFisico) {
                    this.agendasFiltradas.splice(index, 1);
                    console.log('borrar');
                }
            });
        }
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
        this.plex.confirm('¿Está seguro que desea realizar la clonación?').then(conf => {
            if (conf) {
                this.seleccionados.splice(0, 1); // saco el primer elemento que es la agenda original
                this.seleccionados = [...this.seleccionados];
                let data = {
                    idAgenda: this.agenda.id,
                    clones: this.seleccionados
                };
                this.serviceAgenda.clonar(data).subscribe(resultado => {
                    console.log('resultado ', resultado);
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
    }

    cancelar() {
        this.volverAlGestor.emit(true);
    }
}
