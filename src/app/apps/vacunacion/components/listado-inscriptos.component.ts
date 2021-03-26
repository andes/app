import { Component, OnInit } from '@angular/core';
import { InscripcionService } from '../services/inscripcion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';

@Component({
    selector: 'listado-inscriptos',
    templateUrl: 'listado-inscriptos.html',
    styleUrls: ['./listado-inscriptos.scss']
})

export class ListadoInscriptosVacunacionComponent implements OnInit {
    public mainSize = 12;
    public showSidebar = false;
    public pacienteSelected: any;
    public listado: any[] = [];
    public gruposPoblacionales: any[];

    constructor(
        private inscripcionService: InscripcionService,
        private gruposService: GrupoPoblacionalService
    ) { }

    ngOnInit() {
        this.inscripcionService.inscriptosFiltrados$.subscribe(resp => this.listado = resp);
        this.gruposService.search().subscribe(resp => {
            this.gruposPoblacionales = resp;
        });
    }

    showInSidebar(paciente) {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.showSidebar = true;
            this.mainSize = 8;
        }
    }

    closeSidebar() {
        this.showSidebar = false;
        this.mainSize = 12;
        this.pacienteSelected = null;
    }

    grupoPoblacional(nombre: string) {
        const maxLength = 35;
        let descripcion = this.gruposPoblacionales?.find(item => item.nombre === nombre).descripcion;
        if (descripcion?.length > maxLength) {
            return `${descripcion.substring(0, maxLength)} ..`;
        }
        return descripcion;
    }

    onScroll() {
        this.inscripcionService.lastResults.next(this.listado);
    }
}
