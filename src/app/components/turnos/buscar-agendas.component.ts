import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { PlantillaService } from './../../services/turnos/plantilla.service';
import { Router } from '@angular/router';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {
    constructor(public plex: PlexService, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public servicePlantilla: PlantillaService, protected router: Router) { }

    public modelo: any = {};
    public prestaciones: any = [];
    public agendas: any = [];

    ngOnInit() {
        this.modelo = { nombre: "", descripcion: "" };

        this.loadAgendas();
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

    loadAgendas() {
        this.servicePlantilla.get()
            .subscribe(
            agendas => this.agendas = agendas, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    editarAgenda() {
        this.router.navigate(['/plantillas']);
        return false;
    }
}
