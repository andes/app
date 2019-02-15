import { Component, OnInit, OnDestroy } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { Auth } from '@andes/auth';
import { HistorialBusquedaService } from '../services/historialBusqueda.service';

@Component({
    selector: 'busqueda-mpi',
    templateUrl: 'busqueda-mpi.html'
})
export class BusquedaMpiComponent implements OnInit {

    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true;    // True si el campo de búsqueda se encuentra vacío
    showPacienteCru = false;
    pacienteSeleccionado = null;
    busquedasRecientes: IPaciente[] = [];

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
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
        this.busquedasRecientes = this.historialBusquedaService.get();
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
            this.historialBusquedaService.add(paciente);
            this.pacienteCache.setPaciente(paciente);
            this.router.navigate(['apps/mpi/paciente']);  // abre paciente-cru
        }
    }

    registroBebe() {
        this.router.navigate(['apps/mpi/bebe']);
    }

    registroSinDni() {
        this.router.navigate(['apps/mpi/sinDni']);
    }

    registroConDni() {
        this.router.navigate(['apps/mpi/paciente']);
    }

    // --------------------------------------------------

    afterPacienteCru(paciente: IPaciente) {
        this.showPacienteCru = false;
        this.updateTitle('Buscar pacientes');
    }
}
