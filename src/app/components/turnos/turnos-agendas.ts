import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAgenda } from './../../interfaces/turnos/IAgenda';

@Component({
    selector: 'turnos-agendas',
    templateUrl: 'turnos-agendas.html'
})


export class TurnosAgendaComponent implements OnInit {
    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService, private formBuilder: FormBuilder) { }

    public modelo: any = {};
    public prestaciones: any = [];
    public agendas: any = [];
    public turnos: any = [];

    semana: String[];
    showBuscarAgendas: boolean = true;
    showAgenda: boolean = false;
    indice: number = 0;

    @Output()
    selected: EventEmitter<IAgenda> = new EventEmitter<IAgenda>();

    searchForm: FormGroup;

    ngOnInit() {
        this.serviceAgenda.get({
            "fechaDesde": "2016-12-05",
            //"fechaHasta": "2016-01-11",
        }).subscribe(
            agendas => { this.agendas = agendas; this.modelo.agenda = agendas[this.indice]; debugger },
            err => {
                if (err) {
                    console.log(err);
                }
            });
        this.semana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sabado"];
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    editarAgenda(agenda: IAgenda) {
        this.selected.emit(agenda);
    }

    verAgenda(suma: boolean) {
        console.log((this.indice+1)+ "<"+ this.agendas.length);
        var condiciones = suma? ((this.indice+1)<this.agendas.length):((this.indice-1)>=0);
        if (condiciones) {
            if (suma)
                this.indice++
            else
                this.indice--;
            this.modelo.agenda = this.agendas[this.indice];
        }
    }
}