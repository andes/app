import { Plex } from 'andes-plex/src/lib/core/service';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Component, OnInit, Input } from '@angular/core';
import { AgendaService } from './../../services/turnos/agenda.service';
import * as moment from 'moment';
type Estado = 'noSeleccionado' | 'seleccionado'
@Component({
    // tslint:disable-next-line:component-selector-prefix
    selector: 'clonar-agenda',
    templateUrl: 'clonar-agenda.html'
})

export class ClonarAgendaComponent implements OnInit {
    // public agenda: IAgenda;
    // public agendas: IAgenda[] = [];
    private _agenda: any;
    private _agendas: Array<any>;
    private fecha: Date = new Date();
    private calendario: any = [];
    private estado: Estado = 'noSeleccionado';
    private seleccionados: any[] = [];

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }
    @Input('agendas')
    set agendas(value: Array<IAgenda>) {
        this._agendas = value;
    }
    get agendas(): Array<IAgenda> {
        return this._agendas;
    }

    constructor(private ServicioAgenda: AgendaService, public plex: Plex) { }

    ngOnInit() {
        this.ServicioAgenda.getById('5863d1d5d5cc0b46a7e9fa8b').subscribe(agenda => {
            this.agenda = agenda;
            let inicio: Date = this.agenda.horaInicio;
            inicio.setHours(0) ;
            this.seleccionados.push(inicio.getTime()); this.cargarCalendario();
        });
    }

    private cargarCalendario() {
        let inicio = moment(this.fecha).startOf('month').startOf('week');
        let inicioD: Date;
        let dia: any = {};
        this.calendario = [];

        for (let r = 1; r <= 5; r++) {
            let week = [];
            this.calendario.push(week);
            for (let c = 1; c <= 7; c++) {
                let indice = -1;
                if (this.seleccionados){
                    indice = this.seleccionados.indexOf(inicioD.getTime())
                }
                if (indice >= 0) {
                    dia = {
                        fecha: inicio.toDate(),
                        estado: 'seleccionado'
                    }
                } else {
                    dia = {
                        fecha: inicio.toDate(),
                        estado: this.estado
                    }
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
        this.cargarCalendario();
    }

    public seleccionar(dia: any) {
        if (dia.estado === 'noSeleccionado'){
            dia.estado = 'seleccionado';
        } else {
            dia.estado = 'noSeleccionado';
        }
        this.seleccionados.push(dia.fecha.getTime());
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            auxiliar.setHours(horas, minutes);
            return auxiliar;
        } else {
            return null;
        }
    }

    public clonar() {
        let seleccionada = new Date(this.seleccionados[0]);
        let operacion: Observable<IAgenda>;
        this.seleccionados.forEach((seleccion, index) => {
            seleccionada = new Date(seleccion);
            if (seleccionada) {
                let newHoraInicio = this.combinarFechas(seleccionada, new Date(this.agenda.horaInicio));
                console.log('AgendaService.horaInicio ', newHoraInicio);
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
                    bloque.turnos.forEach((turno, index2) => {
                        newIniTurno = this.combinarFechas(seleccionada, turno.horaInicio);
                        turno.horaInicio = newIniTurno;
                    })
                });
                delete this.agenda._id;
                delete this.agenda.id;
                operacion = this.ServicioAgenda.save(this.agenda);
                operacion.subscribe(resultado => {
                    this.plex.alert('La agenda se clonó correctamente');
                });
            }
        });

    }
}