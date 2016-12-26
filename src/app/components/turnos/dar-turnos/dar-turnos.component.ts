import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import * as moment from 'moment';

// Servicios
import { PrestacionService } from '../../../services/turnos/prestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';

@Component({
    templateUrl: 'dar-turnos.html',
})
export class DarTurnosComponent implements AfterViewInit {
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public opciones = {
        fecha: new Date(),
        prestacion: null,
        profesional: null,
    }

    constructor(public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService, public serviceAgenda: AgendaService) { }

    ngAfterViewInit() {
        this.actualizar("sinFiltro");
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    actualizar(etiqueta) {
        let params: any = {};
        if (etiqueta != "sinFiltro") {
            params = {
                "idPrestacion": this.opciones.prestacion ? this.opciones.prestacion.id : '',
                "idProfesional": this.opciones.profesional ? this.opciones.profesional.id : ''
            }
        }
        else {
            this.opciones.prestacion = null;
            this.opciones.profesional = null;
        }
        this.serviceAgenda.get(params).subscribe(agendas => { this.agendas = agendas });
    }

    seleccionarAgenda(agenda) {
        debugger    
        this.agenda = agenda;
        if (agenda==null)
            this.actualizar("sinFiltro");
    }

    cambiarMes(signo) {
        if (signo == "+")
            this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
        else
            this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
        this.actualizar('');
    }
} 