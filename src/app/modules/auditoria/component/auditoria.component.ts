import { Plex } from '@andes/plex';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Subscription } from 'rxjs';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { VincularPacientesComponent } from './vincular-pacientes.component';
import { HistorialBusquedaService } from 'src/app/core/mpi/services/historialBusqueda.service';
import { ReporteErroresComponent } from './reporte-errores.component';

@Component({
    selector: 'auditoria',
    templateUrl: 'auditoria.html',
    styleUrls: ['auditoria.scss']
})

export class AuditoriaComponent implements OnInit {

    @ViewChild('vincularComponent') vincularPacientes: VincularPacientesComponent;
    @ViewChild('erroresComponent') erroresComponent: ReporteErroresComponent;

    // sidebar
    mainSize = 12;
    tituloSidebar = '';
    showDetallePaciente = false;
    showCabeceraDetalle = false;
    // busqueda
    public autoFocus = 0;
    textoLibre: string = null;
    resultadoBusqueda: IPaciente[] = [];
    pacienteSelected: IPaciente = null;
    listaVinculados: IPaciente[] = [];
    loading = false;
    searchClear = true;
    parametros;
    scrollEnd = false;
    searchSubscription = new Subscription();
    // reporte de errores
    permisoEdicion: boolean;
    permisoVincular: boolean;
    showReporteError = false; // se muestra en el sidebar datos del error reportado
    listaReportes = []; // historial de reportes del paciente

    constructor(
        public auth: Auth,
        private pacienteService: PacienteService,
        private plex: Plex,
        private router: Router,
        private historialBusquedaService: HistorialBusquedaService
    ) { }

    // Cargamos todos los pacientes temporales y activos
    ngOnInit() {
        if (!(this.auth.getPermissions('auditoriaPacientes:?').length > 0)) {
            this.router.navigate(['./inicio']);
            return;
        }
        this.permisoEdicion = this.auth.check('auditoriaPacientes:edicion');
        this.permisoVincular = this.auth.check('auditoriaPacientes:vincular');
        this.parametros = {
            skip: 0,
            limit: 10
        };
    }


    // REPORTE DE ERRORES -----------------------------------------

    onSelect(paciente: IPaciente): void {
        this.pacienteSelected = paciente;
        this.showInSidebar('detallePaciente');
    }

    onSelectReportado(data: any): void {
        if (data.paciente) {
            this.pacienteSelected = data.paciente;
            this.listaReportes = data.listadoReportes;
            this.showInSidebar('reporteError');
        } else {
            this.pacienteSelected = null;
        }
    }

    onSelectCorregir() {
        this.erroresComponent.corregirError();
    }

    showInSidebar(opcion: string) {
        switch (opcion) {
        case 'detallePaciente':
            this.tituloSidebar = 'Detalle Paciente';
            this.showDetallePaciente = true;
            this.showCabeceraDetalle = false;
            this.showReporteError = false;
            this.vincularPacientes.close();
            this.mainSize = 8;
            break;
        case 'vinculaciones':
            this.tituloSidebar = 'Detalle Paciente';
            this.showDetallePaciente = false;
            this.showCabeceraDetalle = true;
            this.showReporteError = false;
            this.mainSize = 8;
            break;
        case 'reporteError':
            this.tituloSidebar = 'Detalle Reporte';
            this.showDetallePaciente = false;
            this.showReporteError = true;
            this.mainSize = 8;
            break;
        case 'vincular':
            this.tituloSidebar = 'Buscar candidato';
            this.showDetallePaciente = false;
            this.showCabeceraDetalle = false;
            this.mainSize = 8;
            break;
        }
    }

    closeSidebar() {
        this.mainSize = 12;
        this.pacienteSelected = null;
        this.showDetallePaciente = false;
        this.showCabeceraDetalle = false;
        this.showReporteError = false;
        this.vincularPacientes.close();
    }

    // VINCULACION Y ESTADO ACTIVO ----------------------------

    setEstadoActivo([paciente, activo]: [IPaciente, boolean]) {
        if (this.permisoVincular) {
            // si el paciente tiene otros pacientes en su array de identificadores, no lo podemos desactivar
            if (paciente.identificadores && paciente.identificadores.filter(identificador => identificador.entidad === 'ANDES').length) {
                this.plex.info('warning', 'Existen otros pacientes vinculados a este paciente', 'No Permitido');
                return;
            }
            this.pacienteService.setActivo(paciente, activo).subscribe(res => {
                // Actualizamos resultados en panel principal
                this.buscar();
                if (activo) {
                    this.plex.toast('success', 'Paciente Activado');
                } else {
                    this.historialBusquedaService.delete(paciente);
                    this.plex.toast('info', 'Paciente Desactivado');
                }
            });
        }
    }

    showVinculados(paciente: IPaciente) {
        // Actualizamos sidebar de vinculaciones
        this.pacienteSelected = paciente;
        this.showInSidebar('vinculaciones');
        this.vincularPacientes.loadVinculados(paciente);

        // Actualizamos resultados en panel principal
        this.buscar();
    }

    vincular(paciente: IPaciente) {
        if (this.permisoVincular) {
            this.pacienteSelected = paciente;
            this.showInSidebar('vincular');
            this.vincularPacientes.buscarCandidatos();
        } else {
            this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
        }
    }

    desvincular(paciente: IPaciente) {
        if (this.permisoVincular) {
            this.vincularPacientes.desvincular(paciente);
        } else {
            this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
        }
    }


    // BUSQUEDA DE PACIENTES ------------------------------------------------

    buscar(resetParams = true) {
        if (resetParams) {
            this.resultadoBusqueda = [];
            this.parametros.skip = 0;
            this.scrollEnd = false;
        }

        if (!this.textoLibre || !this.textoLibre.length) {
            this.onSearchClear();
            return;
        }
        const busqueda = this.textoLibre.trim();
        const params = {
            search: busqueda,
            skip: this.parametros.skip,
            limit: this.parametros.limit
        };

        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }

        this.onSearchStart();
        this.searchSubscription = this.pacienteService.get(params).subscribe((resultado: any) => {
            if (resultado && resultado.length) {
                this.resultadoBusqueda = this.resultadoBusqueda.concat(resultado);
            }
            this.parametros.skip = this.resultadoBusqueda.length;
            this.loading = false;
            // si vienen menos pacientes que {{ limit }} significa que ya se cargaron todos
            if (!resultado.length || resultado.length < this.parametros.limit) {
                this.scrollEnd = true;
            }
        });
    }


    /**
   * Recibe el último resultado emitido y le realiza una nueva búsqueda por texto
   * retornando ambos resultados concatenados
   */
    public onScroll() {
        if (!this.scrollEnd) {
            this.buscar(false);
        }
    }


    onSearchStart() {
        this.searchClear = false;
        this.loading = true;
    }

    onSearchClear() {
        this.searchClear = true;
        this.loading = false;
        this.resultadoBusqueda = [];
    }

    tieneNombreApellidoCorrecto() {
        return (this.pacienteSelected.nombreCorrectoReportado && !this.pacienteSelected.apellidoCorrectoReportado) || !this.pacienteSelected.nombreCorrectoReportado && this.pacienteSelected.apellidoCorrectoReportado;
    }

    tieneNotaError() {
        return !this.pacienteSelected.nombreCorrectoReportado && !this.pacienteSelected.apellidoCorrectoReportado && this.pacienteSelected.notaError;
    }

    noTieneNotaError() {
        return !this.pacienteSelected.nombreCorrectoReportado && !this.pacienteSelected.apellidoCorrectoReportado && !this.pacienteSelected.notaError;
    }
}
