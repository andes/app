import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Plex } from 'andes-plex/src/lib/core/service';
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

    public showTurnos: boolean = false;
    public showVistaAgendas: boolean = false;

    searchForm: FormGroup;

    ag: IAgenda;
    vistaAgenda: IAgenda;

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
        this.ag = agenda;
        this.vistaAgenda = agenda;

        if (this.agendaSel) {
            this.agendaSel.agendaSeleccionada = false;
            this.agendaSel.agendaSeleccionadaColor = 'default';
        }

        agenda.agendaSeleccionada = true;

        this.setColorEstadoAgenda(this.ag);

        this.agendaSel = agenda;

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

}

class AgendaSeleccionada {
    public agendaSeleccionada: boolean;
    public agendaSeleccionadaColor: String;
}
