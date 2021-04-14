import { Component, OnInit } from '@angular/core';
import { InscripcionService } from '../services/inscripcion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { Plex } from '@andes/plex';

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
    public candidatos: any[];
    public candidatosBuscados = false;

    constructor(
        private inscripcionService: InscripcionService,
        private gruposService: GrupoPoblacionalService,
        private auth: Auth,
        private router: Router,
        private pacienteService: PacienteService,
        private plex: Plex
    ) { }

    ngOnInit() {
        if (!this.auth.check('visualizacionInformacion:listadoInscriptos')) {
            this.router.navigate(['/inicio']);
        }
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
            this.candidatosBuscados = false;
        }
    }

    buscarCandidatos() {
        if (this.pacienteSelected) {
            this.candidatosBuscados = false;
            this.pacienteService.get({
                documento: this.pacienteSelected.documento,
                sexo: this.pacienteSelected.sexo,
                activo: true
            }).subscribe(resp => {
                this.candidatos = resp;
                this.candidatosBuscados = true;
            });
        }
    }

    asociarCandidato(candidato) {
        this.pacienteSelected.paciente = {
            addAt: new Date(),
            id: candidato.id
        };
        this.inscripcionService.save(this.pacienteSelected).subscribe(resp => this.pacienteSelected = resp);
        this.plex.toast('success', 'El paciente se ha asociado correctamente.');
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
