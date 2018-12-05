import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IDireccion } from '../interfaces/IDireccion';
import { ParentescoService } from '../../../services/parentesco.service';
import { IContacto } from '../../../interfaces/IContacto';
import * as enumerados from '../../../utils/enumerados';
import { PacienteService } from '../services/paciente.service';
import { PacienteCruComponent } from './paciente-cru.component';
import { Router } from '@angular/router';

@Component({
    selector: 'busqueda-mpi',
    templateUrl: 'busqueda-mpi.html',
    styleUrls: ['busqueda-mpi.scss']
})
export class BusquedaMpiComponent implements OnInit {
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true;    // True si el campo de búsqueda se encuentra vacío
    showPacienteCru = false;
    pacienteSeleccionado = null;

    constructor(
        private plex: Plex,
        private pacienteService: PacienteService,
        public router: Router) { }

    ngOnInit() {
        this.updateTitle('Buscar un paciente');
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle('MPI / ' + nombre);
        this.plex.updateTitle([{
            route: 'inicio',
            name: 'INICIO'
        }, {
            name: nombre
        }]);
    }

    // -------------- SOBRE BUSCADOR ----------------

    searchStart() {
        this.loading = true;
    }

    searchEnd(pacientes: IPaciente[]) {
        this.searchClear = false;
        this.loading = false;
        this.resultadoBusqueda = pacientes;
    }

    onSearchClear() {
        this.searchClear = true;
        this.resultadoBusqueda = [];
    }

    // ------------- SOBRE LISTA RESULTADO --------------

    onPacienteSelected(paciente: IPaciente) {
        if (paciente) {
            // Pasaje de datos solo de prueba hasta resolver navegabilidad
            let params = [JSON.stringify(paciente)];
            this.router.navigate(['apps/mpi/paciente'], { queryParams: params });  // abre paciente-cru
        }
    }

    // --------------------------------------------------

    afterPacienteCru(paciente: IPaciente) {
        this.showPacienteCru = false;
        this.updateTitle('Buscar un paciente');
    }
}
