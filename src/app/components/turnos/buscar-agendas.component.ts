import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAgenda } from './../../interfaces/turnos/IAgenda';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {
    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService, private formBuilder: FormBuilder) { }

    public modelo: any = {};
    public prestaciones: any = [];
    public agendas: any = [];

    showBuscarAgendas: boolean = true;
    showAgenda: boolean = false;
    seleccionada: boolean = false;

    @Output()
    selected: EventEmitter<IAgenda> = new EventEmitter<IAgenda>();

    searchForm: FormGroup;

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            fechaDesde: [new Date()],
            fechaHasta: [new Date()],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: [''],
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

            this.serviceAgenda.get({
                "fechaDesde": value.fechaDesde,
                "fechaHasta": value.fechaHasta,
                "idPrestacion": value.prestaciones.id,
                "idProfesional": value.profesionales.id,
                "idEspacioFisico": value.espacioFisico.id
            }).subscribe(
                agendas => { this.agendas = agendas },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        })

        this.modelo = {
            fecha: [''],
            horaInicio: [''],
            horaFin: [''],
            espacioFisico: ['']
        };
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    editarAgenda(agenda: IAgenda) {
        this.selected.emit(agenda);
    }

    verAgenda(agenda) {
        this.seleccionada = true;
        var fecha = new Date(agenda.horaInicio);
        var horaFin = new Date(agenda.horaFin);
        this.modelo = {
            fecha: fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear(),
            horaInicio: fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '')+fecha.getMinutes(),
            horaFin: horaFin.getHours() + ':' + (horaFin.getMinutes() < 10 ? '0' : '')+horaFin.getMinutes(),
            profesionales: agenda.profesionales,
            prestaciones: agenda.prestaciones,
            espacioFisico: agenda.espacioFisico.nombre,
            bloques: agenda.bloques
        };
    }
}