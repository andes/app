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
    public agenda: any;
    public agendas: any = [];
    public opciones = {
        fecha: new Date(),
        prestacion: null,
        profesional: null,
    }

    constructor(public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService, public serviceAgenda: AgendaService) { }

    ngAfterViewInit(){
        this.actualizar();
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    actualizar() {
        this.serviceAgenda.get({
            //"fechaDesde": moment(this.opciones.fecha).startOf("month").toDate(),
            //"fechaHasta": moment(this.opciones.fecha).endOf("month").toDate(),
            //"idPrestacion": value.prestaciones.id,
            //"idProfesional": value.profesionales.id,
        }).subscribe(agendas => { this.agendas = agendas });
    }

    seleccionarAgenda(agenda){
        this.agenda = agenda;
    }
}