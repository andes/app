import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import * as moment from 'moment';

@Component({
    templateUrl: 'gestor-agendas.html'
})

export class GestorAgendasComponent implements OnInit {

    public agendas: any = [];
    public agendaSel: AgendaSeleccionada;

    agendasSeleccionadas: any[] = [];

    public showGestorAgendas: Boolean = true;
    public showTurnos: Boolean = false;
    public showVistaAgendas: Boolean = false;
    public showClonar: Boolean = false;
    public showDarTurnos: Boolean = false;
    public showEditarAgenda: Boolean = false;

    public modelo: any = {};

    searchForm: FormGroup;

    ag: IAgenda;
    vistaAgenda: IAgenda;
    reasignar: IAgenda;
    editaAgenda: IAgenda;

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: PrestacionService,
        public serviceProfesional: ProfesionalService, public serviceEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService, private router: Router) { }

    ngOnInit() {

        this.searchForm = this.formBuilder.group({
            fechaDesde: [new Date()],
            fechaHasta: [new Date()],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: [''],
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

            let fechaDesde = moment(value.fechaDesde).startOf('day').format();
            let fechaHasta = moment(value.fechaHasta).endOf('day').format();

            this.serviceAgenda.get({
                'fechaDesde': fechaDesde,
                'fechaHasta': fechaHasta,
                'idPrestacion': value.prestaciones.id,
                'idProfesional': value.profesionales.id,
                'idEspacioFisico': value.espacioFisico.id
            }).subscribe(
                agendas => { this.agendas = agendas; },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        });

        this.loadAgendas();
    }

    clonar(modelo) {
        this.modelo = modelo;

        this.showGestorAgendas = false;
        this.showClonar = true;
    }

    cancelaClonar() {
        this.showGestorAgendas = true;
        this.showClonar = false;
    }

    reasignaTurno(reasTurno) {
        debugger;
        this.reasignar = reasTurno;

        this.showGestorAgendas = false;
        this.showDarTurnos = true;
    }

    editarAgenda(agenda) {
        debugger;
        this.editaAgenda = agenda;

        this.showGestorAgendas = false;
        this.showEditarAgenda = true;
    }

    cancelarEditarAgendaEmit() {
        debugger;
        this.showGestorAgendas = true;
        this.showEditarAgenda = false;
    }

    loadAgendas() {

        let fecha = moment().format();

        let fechaDesde = moment(fecha).startOf('day').format();
        let fechaHasta = moment(fecha).endOf('day').format();

        this.serviceAgenda.get({
            'fechaDesde': fechaDesde,
            'fechaHasta': fechaHasta,
            'idPrestacion': '',
            'idProfesional': '',
            'idEspacioFisico': ''
        }).subscribe(
            agendas => { this.agendas = agendas; },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get({}).subscribe(event.callback);
    }

    verAgenda(agenda) {
        let index;

        if (agenda.agendaSeleccionada) {
            agenda.agendaSeleccionada = false;
            agenda.agendaSeleccionadaColor = 'default';

            index = this.agendasSeleccionadas.indexOf(agenda);
            this.agendasSeleccionadas.splice(index, 1);
        } else {
            agenda.agendaSeleccionada = true;

            this.agendaSel = agenda;
            this.agendasSeleccionadas.push(agenda);
        }

        agenda.agendasSeleccionadas = this.agendasSeleccionadas;

        this.setColorEstadoAgenda(agenda);

        this.ag = agenda;
        this.vistaAgenda = agenda;

        this.showTurnos = true;
        this.showVistaAgendas = true;
    }

    setColorEstadoAgenda(agenda) {
        if (agenda.estado === 'Suspendida') {
            agenda.agendaSeleccionadaColor = 'danger';
        } else {
            agenda.agendaSeleccionadaColor = 'success';
        }
    }

    crearAgenda() {
        this.router.navigate(['./agenda']);
        return false;
    }

    gestorAgendas() {
        this.showGestorAgendas = false;
    }
}

class AgendaSeleccionada {
    public agendaSeleccionada: boolean;
    public agendasSeleccionadas: any = [];
    public agendaSeleccionadaColor: String;
}
