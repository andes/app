import { Component, OnInit } from '@angular/core';
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

    historialSeleccionados: IPaciente[] = [];
    escaneado: boolean;
    sidebar = 8;
    paciente: IPaciente = null;
    showDetallePaciente = false;

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
        private pacienteCache: PacienteCacheService,
        private plex: Plex,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.plex.clearNavbar();
        this.updateTitle('Buscar pacientes');
        if (!(this.auth.getPermissions('mpi:?').length > 0)) {
            // Si no está autorizado redirect al home
            this.router.navigate(['./inicio']);
        }
        this.historialSeleccionados = this.historialBusquedaService.get();
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


    onSearchEnd(pacientes: any[], scan: string) {
        this.escaneado = scan?.length > 0;
        if (this.escaneado) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanCode(scan);
            this.router.navigate(['apps/mpi/paciente']);  // abre paciente-cru
        }
    }


    // ------------- SOBRE LISTA RESULTADO --------------

    toEdit(paciente: IPaciente) {
        if (paciente) {
            this.historialBusquedaService.add(paciente);
            this.pacienteCache.setPaciente(paciente);
            if (paciente.numeroIdentificacion || paciente.tipoIdentificacion) {
                this.router.navigate(['apps/mpi/paciente/extranjero/mpi']);  // abre formulario paciente extranjero
            } else {
                this.router.navigate(['apps/mpi/paciente']);  // abre formulario paciente con/sin-dni
            }
        }
    }

    toVisualize(paciente: IPaciente) {
        this.paciente = paciente ? paciente : null;
        this.showDetallePaciente = (this.paciente != null);
    }

    closeDetallePaciente() {
        this.showDetallePaciente = false;
        this.paciente = null;
    }

    // --------------------------------------------------

    afterPacienteCru(paciente: IPaciente) {
        this.updateTitle('Buscar pacientes');
    }
}
