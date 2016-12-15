import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'calendario',
    templateUrl: 'calendario.html',
})
export class CalendarioComponent {
    private _agendas: Array<any>;
    private calendario: any = [];

    //constructor(private formBuilder: FormBuilder, public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService, public serviceAgenda: AgendaService) { }
    // Propiedades
    @Output('agenda-changed') onChange = new EventEmitter();
    @Input('fecha') fecha: Date;
    @Input('agenda') agenda: any;
    @Input('agendas')
    set agendas(value: Array<any>) {
        this._agendas = value;
        this.actualizar();
    }
    get agendas(): Array<any> {
        return this._agendas;
    }

    private agendaPorFecha(fecha: moment.Moment): any {
        return this.agendas.find(i => {
            return moment(fecha).isSame(i.horaInicio, "day")
        });
    }

    private actualizar() {
        if (this.fecha && this.agendas) {
            let inicio = moment(this.fecha).startOf("month").startOf("week");
            this.calendario = [];
            for (let r = 1; r <= 5; r++) {
                let week = [];
                this.calendario.push(week);
                for (let c = 1; c <= 7; c++) {
                    inicio.add(1, "day");
                    let day = {
                        fecha: inicio.toDate(),
                        agenda: this.agendaPorFecha(inicio),
                        estado: "vacio"
                    };

                    if (day.agenda) {
                        // ¿Hay una agenda seleccionada?
                        if (this.agenda && inicio.isSame(this.agenda.horaInicio, "day"))
                            day.estado = "seleccionado";
                        else {
                            // TODO: Controlar si hay turnos disponibles
                            day.estado = "disponible"
                        }
                    }

                    week.push(day);
                }
            }
        }
    }

    private seleccionar(day) {
        if (day.agenda) {
            this.agenda = day.agenda;
            this.onChange.emit(day.agenda);
            this.actualizar();
        }
    }
}