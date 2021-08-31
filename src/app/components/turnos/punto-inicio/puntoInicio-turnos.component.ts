import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

// Interfaces
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

// Servicios
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { AppMobileService } from '../../../services/appMobile.service';
import { PacienteCacheService } from '../../../core/mpi/services/pacienteCache.service';

@Component({
    selector: 'puntoInicio-turnos',
    templateUrl: 'puntoInicio-turnos.html',
    styleUrls: ['puntoInicio-turnos.scss']
})

export class PuntoInicioTurnosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    public disableNuevoPaciente = true;
    public puedeCrearSolicitud = false;
    public puedeAutocitar = false;
    public puedeDarTurno = false;
    public alerta = false;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;
    public showMostrarEstadisticasAgendas = true;
    public showMostrarEstadisticasPacientes = false;
    public showActivarApp = false;
    public showIngresarSolicitud = false;
    public paciente: IPaciente;
    public autorizado = false;
    public puedeActivarAppMobile = false;
    solicitudPrestacion: any = null; // Es la solicitud que se pasa como input a darTurnos
    operacionTurnos = '';
    showDarTurnos = false;
    showDashboard = true;
    showMostrarTurnosPaciente = false;
    showCreateUpdate = false;
    seleccion = null;
    esEscaneado = false;
    textoPacienteSearch = '';
    turnoArancelamiento: any;
    showTab = 0;
    private esOperacion = false;

    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true; // True si el campo de búsqueda se encuentra vacío

    canCreate = this.auth.check('mpi:paciente:postAndes');

    constructor(
        private pacienteCache: PacienteCacheService,
        public servicePaciente: PacienteService,
        public auth: Auth,
        public appMobile: AppMobileService,
        private router: Router,
        private _activatedRoute: ActivatedRoute,
        private plex: Plex,
    ) {
    }

    ngOnInit() {
        this._activatedRoute.params.subscribe(parameters => {
            if (parameters && parameters['idPaciente']) {
                this.getPacienteById(parameters['idPaciente']);
                window.history.replaceState({}, '', '/citas/punto-inicio');
            }
        });
        this.autorizado = this.auth.getPermissions('turnos:puntoInicio:?').length > 0;
        this.puedeDarTurno = this.auth.getPermissions('turnos:puntoInicio:darTurnos:?').length > 0;
        this.puedeCrearSolicitud = this.auth.getPermissions('turnos:puntoInicio:solicitud:?').length > 0;
        this.puedeActivarAppMobile = this.auth.getPermissions('turnos:puntoInicio:activarMobile:?').length > 0;
        this.updateTitle('Punto de inicio');
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle([{
            route: 'inicio',
            name: 'CITAS'
        }, {
            name: nombre
        }]);
    }

    // -------------- SOBRE BUSCADOR ----------------

    onSearchStart() {
        this.showMostrarEstadisticasAgendas = true;
        this.esOperacion = false;
        this.disableNuevoPaciente = false;
        this.esEscaneado = false;
        this.paciente = null;
        this.loading = true;
    }

    onSearchEnd(pacientes: any[], scan: string) {
        this.esEscaneado = scan?.length > 0;
        this.searchClear = false;
        this.loading = false;
        if (this.esEscaneado && pacientes.length === 1) {
            if (pacientes[0].paciente) {
                this.pacienteCache.setPaciente(pacientes[0].paciente);
                this.pacienteCache.setScanCode(scan);
                this.onPacienteSelected(pacientes[0].paciente);
            } else {
                this.pacienteCache.setPaciente(pacientes[0]);
                this.pacienteCache.setScanCode(scan);
                this.onPacienteSelected(pacientes[0]);
            }

            this.searchClear = true;
        } else {
            this.resultadoBusqueda = pacientes;
        }
    }

    onSearchClear() {
        this.disableNuevoPaciente = true;
        this.searchClear = true;
        this.resultadoBusqueda = [];
        this.paciente = null;
    }


    // -----------------------------------------------

    volverAPuntoInicio() {
        this.showDashboard = true;
    }

    onPacienteSelected(paciente: IPaciente): void {
        this.showTab = 0;
        this.paciente = paciente;
        if (!paciente.id || (paciente.estado === 'temporal' && paciente.scan)) {
            this.router.navigate(['/apps/mpi/paciente/con-dni/puntoInicio']); // abre paciente-cru
        } else {
            this.getPacienteById(paciente.id);
        }
    }

    private getPacienteById(idPaciente: string) {
        this.showMostrarEstadisticasAgendas = false;
        this.servicePaciente.getById(idPaciente).subscribe(pacienteMPI => {
            this.paciente = pacienteMPI;
            if (this.esOperacion) {
                this.esOperacion = false;
            } else {
                this.showMostrarEstadisticasPacientes = true;
                this.showIngresarSolicitud = false;
                this.showMostrarTurnosPaciente = false;
                this.showActivarApp = false;
            }
        });
    }


    verificarOperacion(operacion, paciente) {
        this.esOperacion = true;
        this.showActivarApp = false;
        this.paciente = paciente;

        switch (operacion) {
            case 'darTurno':
                // Si se seleccionó por error un paciente fallecido
                this.servicePaciente.checkFallecido(paciente);
                this.solicitudPrestacion = null;
                this.showDashboard = false;
                this.showMostrarTurnosPaciente = false;
                this.showIngresarSolicitud = false;
                this.showDarTurnos = true;
                this.updateTitle('Dar turno');
                break;
            case 'ingresarSolicitud':
                this.showIngresarSolicitud = true;
                this.showMostrarTurnosPaciente = false;
                this.showMostrarEstadisticasPacientes = false;
                break;
            case 'operacionesTurno':
                this.showMostrarEstadisticasAgendas = false;
                this.showMostrarEstadisticasPacientes = false;
                this.showIngresarSolicitud = false;
                this.operacionTurnos = 'operacionesTurno';
                this.showMostrarTurnosPaciente = true;
                break;
            case 'activarApp':
                this.showMostrarEstadisticasAgendas = false;
                this.showMostrarEstadisticasPacientes = false;
                this.showMostrarTurnosPaciente = false;
                this.showIngresarSolicitud = false;
                this.showActivarApp = true;
                break;
        }
    }

    actualizarPaciente(actualizar) {
        this.showCreateUpdate = actualizar;
        this.showDashboard = !actualizar;
    }

    afterDarTurno(pac) {
        this.showDarTurnos = false;
        this.showDashboard = true;
        this.showTab = 1;
        if (this.paciente && pac) {
            if (pac.carpetaEfectores && pac.carpetaEfectores.length > 0) {
                this.paciente.carpetaEfectores = pac.carpetaEfectores;
            }
        }
        this.esOperacion = false;
        this.showMostrarEstadisticasAgendas = false;
        this.showMostrarEstadisticasPacientes = true;
        this.showIngresarSolicitud = false;
        this.showMostrarTurnosPaciente = false;
        this.updateTitle('Punto de inicio');
    }

    cancelarSolicitudVentanilla() {
        this.showDashboard = true;
        this.showMostrarEstadisticasAgendas = false;
        this.showMostrarEstadisticasPacientes = true;
        this.showIngresarSolicitud = false;
        this.showMostrarTurnosPaciente = false;
    }

    verificarCodificarAgendas() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            this.redirect('dashboard_codificacion');
        }
    }

    darTurnoSolicitud(event) {
        this.solicitudPrestacion = event;
        this.showDarTurnos = true;
        this.showDashboard = false;
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    showDatos() {
        this.showMostrarEstadisticasPacientes = true;
        this.showIngresarSolicitud = false;
        this.showMostrarTurnosPaciente = false;
        this.showActivarApp = false;
    }
}
