import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'buscar-agendas',
    templateUrl: 'buscar-agendas.html'
})

export class BuscarAgendasComponent implements OnInit {
    constructor(public plex: PlexService, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService) { }

    public modelo: any = {};
    public prestaciones: any = [];

    ngOnInit() {
        this.modelo = { nombre: "", descripcion: "" };
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
}
