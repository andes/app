import { Component, OnInit, OnDestroy } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'busqueda-mpi',
    templateUrl: 'busqueda-mpi.html',
    styleUrls: ['busqueda-mpi.scss']
})
export class BusquedaMpiComponent implements OnInit {

    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true;    // True si el campo de búsqueda se encuentra vacío
    showPacienteCru = false;
    pacienteSeleccionado = null;

    constructor(
        private pacienteCache: PacienteCacheService,
        private plex: Plex,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.updateTitle('Buscar pacientes');
        if (!(this.auth.getPermissions('mpi:?').length > 0)) {
            // Si no está autorizado redirect al home
            this.router.navigate(['./inicio']);
        }
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

    searchEnd(pacientes: IPaciente[], escaneado: boolean) {
        this.searchClear = false;
        this.loading = false;
        this.pacienteCache.setScanState(escaneado);
        this.resultadoBusqueda = pacientes;
    }

    onSearchClear() {
        this.searchClear = true;
        this.resultadoBusqueda = [];
    }

    // ------------- SOBRE LISTA RESULTADO --------------

    onPacienteSelected(paciente: IPaciente) {
        if (paciente) {
            this.pacienteCache.setPaciente(paciente);
            this.router.navigate(['apps/mpi/paciente']);  // abre paciente-cru
        }
    }

    // --------------------------------------------------

    afterPacienteCru(paciente: IPaciente) {
        this.showPacienteCru = false;
        this.updateTitle('Buscar un paciente');
    }
}
