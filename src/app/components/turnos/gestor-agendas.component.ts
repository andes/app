import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';

@Component({
    templateUrl: 'gestor-agendas.html',
})

export class GestorAgendasComponent implements OnInit {

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceAgenda: AgendaService) { }

    searchForm: FormGroup;

    public agendas: any = [];

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
}