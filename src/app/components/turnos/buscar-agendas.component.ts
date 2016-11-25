import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { PlantillaService } from './../../services/turnos/plantilla.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IPlantilla } from './../../interfaces/turnos/IPlantilla';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {
    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public servicePlantilla: PlantillaService, protected router: Router, private formBuilder: FormBuilder) { }

    public modelo: any = {};
    public prestaciones: any = [];
    public agendas: any = [];

    showBuscarAgendas: boolean = true;
    showPlantilla: boolean = false;
    selectedAgenda: string;

    @Output()
    selected: EventEmitter<IPlantilla> = new EventEmitter<IPlantilla>();

    searchForm: FormGroup;

    ngOnInit() {
        // this.modelo = { nombre: "", descripcion: "" };

        this.searchForm = this.formBuilder.group({
            fechaDesde: [new Date()],
            fechaHasta: [new Date()],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

            this.servicePlantilla.get({
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
        this.serviceProfesional.get().subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    editarAgenda(agenda: IPlantilla) {

        this.selected.emit(agenda);
    }

    verAgenda(agenda) {
        var fecha = new Date(agenda.horaInicio);
        var horaFin = new Date(agenda.horaFin);


        
        debugger;
        this.modelo = {
            fecha: fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear(),
            horaInicio: fecha.getHours() + ':' + fecha.getMinutes(),
            horaFin: horaFin.getHours() + ':' + horaFin.getMinutes(),
            profesional: agenda.profesionales[0].nombre + ' ' + agenda.profesionales[0].apellido,
            prestaciones: agenda.prestaciones[0].nombre,
            espacioFisico: agenda.espacioFisico.nombre,
            bloques: [{
                descripcion: agenda.bloques[0].descripcion
            }
            ]
        };
    }
}
