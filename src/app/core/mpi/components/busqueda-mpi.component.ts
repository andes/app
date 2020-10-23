import { Component, OnInit } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { Auth } from '@andes/auth';
import { HistorialBusquedaService } from '../services/historialBusqueda.service';
import { PacienteService } from '../services/paciente.service';

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
    fieldsDetalle = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'telefono', 'direccion'];

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
        private pacienteCache: PacienteCacheService,
        private pacienteService: PacienteService,
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


    onSearchEnd(pacientes: any[], escaneado: boolean) {
        this.escaneado = escaneado;
        if (escaneado) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanState(this.escaneado);
            this.router.navigate(['apps/mpi/paciente']);  // abre paciente-cru
        }
    }


    // ------------- SOBRE LISTA RESULTADO --------------

    toEdit(paciente: IPaciente) {
        if (paciente) {
            this.historialBusquedaService.add(paciente);
            // obtenemos el paciente actualizado (si es inactivo, no se puede editar)
            this.pacienteService.getById(paciente.id).subscribe(
                resultado => {
                    if (resultado) {
                        paciente = resultado;
                        if (paciente.activo) {
                            this.pacienteCache.setPaciente(paciente);
                            this.pacienteCache.setScanState(this.escaneado);
                            if (paciente.numeroIdentificacion || paciente.tipoIdentificacion) {
                                this.router.navigate(['apps/mpi/paciente/extranjero/mpi']);  // abre formulario paciente extranjero
                            } else {
                                this.router.navigate(['apps/mpi/paciente']);  // abre formulario paciente con/sin-dni
                            }
                        } else {
                            this.plex.toast('info', 'No es posible editar un paciente Inactivo');
                        }
                    }

                });

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
