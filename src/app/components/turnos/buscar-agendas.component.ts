import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { PlantillaService } from './../../services/turnos/plantilla.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {
    constructor(public plex: PlexService, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public servicePlantilla: PlantillaService, protected router: Router, private formBuilder: FormBuilder) { }

    public modelo: any = {};
    public prestaciones: any = [];
    public agendas: any = [];
    public profesionales: any = [];

    searchForm: FormGroup;

    ngOnInit() {
        // this.modelo = { nombre: "", descripcion: "" };

        this.searchForm = this.formBuilder.group({
            fechaDesde: [''],
            fechaHasta: [''],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            debugger;
            this.servicePlantilla.get({
                desde: value.desde,
                idProfesional: value.profesional && value.profesional.id,
            }
            )
        })

        this.loadAgendas();
        
    }
    loadAgendas() {
        this.servicePlantilla.get()
            .subscribe(
            agendas => this.agendas = agendas,
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadAgendasFiltradas(nombre: string) {
        debugger;
        this.servicePlantilla.getByTerm(nombre)
            .subscribe(
            agendas => this.agendas = agendas, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
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

    editarAgenda() {
        this.router.navigate(['/plantillas']);
        return false;
    }

    verAgenda(agenda) {
        var pepe = new Date(agenda.horaInicio);

        var capo = (pepe.getFullYear().toString() + '-'
            + ("0" + (pepe.getMonth() + 1)).slice(-2) + '-'
            + ("0" + (pepe.getDate()
            )).slice(-2));

        alert(capo);

        this.modelo = {
            fecha: capo,
            horaInicio: agenda.horaInicio,
            horaFin: agenda.horaFin,
            profesional: agenda.profesionales[0].nombre + ' ' + agenda.profesionales[0].apellido,
            prestaciones: agenda.prestaciones[0].nombre,
            espacioFisico: agenda.espacioFisico.nombre
        };
    }
}
