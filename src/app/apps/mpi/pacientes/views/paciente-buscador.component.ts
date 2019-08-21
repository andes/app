import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { HistorialBusquedaService } from '../services/historialBusqueda.service';

@Component({
    selector: 'paciente-buscador',
    templateUrl: 'paciente-buscador.html'
})
export class PacienteBuscadorComponent implements OnInit {
    public disableNuevoPaciente = true;
    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true;    // True si el campo de búsqueda se encuentra vacío
    escaneado: boolean;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public historialSvc: HistorialBusquedaService,
        private pacienteCache: PacienteCacheService
    ) { }

    ngOnInit() {
        this.plex.clearNavbar();
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

    onSearchStart() {
        this.disableNuevoPaciente = false;
        this.loading = true;
    }

    onSearchEnd(pacientes: any[], escaneado: boolean, busqueda: string) {
        this.searchClear = false;
        this.escaneado = escaneado;
        this.loading = false;
        if (escaneado) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanState(this.escaneado);
            this.router.navigate(['/mpi/paciente']);  // abre paciente-cru
        } else {
            this.resultadoBusqueda = pacientes;
        }
    }

    onSearchClear() {
        this.disableNuevoPaciente = true;
        this.searchClear = true;
        this.resultadoBusqueda = [];
    }

    // ------------- SOBRE LISTA RESULTADO --------------

    onPacienteSelected(paciente: IPaciente) {
        if (paciente) {
            this.historialSvc.add(paciente);
            this.pacienteCache.setPaciente(paciente);
            this.pacienteCache.setScanState(this.escaneado);
            this.router.navigate(['/mpi/paciente']);  // abre paciente-cru
        }
    }

    // --------------------------------------------------

    afterPacienteCru(paciente: IPaciente) {
        this.updateTitle('Buscar pacientes');
    }
}
