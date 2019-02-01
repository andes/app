import { Constantes } from './../../controllers/constants';
import { LaboratorioContextoCacheService } from './../../services/protocoloCache.service';
import { IPaciente } from './../../../../../interfaces/IPaciente';
import { AppMobileService } from './../../../../../services/appMobile.service';
import { PacienteService } from './../../../../../services/paciente.service';
import { Component, OnInit, Output, EventEmitter, HostBinding, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';

@Component({
    selector: 'punto-inicio-laboratorio',
    templateUrl: 'punto-inicio.html',
    styleUrls: ['../../assets/laboratorio.scss']
})

export class PuntoInicioLaboratorioComponent implements OnInit, OnDestroy {

    @HostBinding('class.plex-layout') layout = true;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() pacienteSinTurnoEmitter: EventEmitter<any> = new EventEmitter<any>();


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
    public showListaSolicitudes = false;
    public paciente: IPaciente;
    public autorizado = false;
    solicitudPrestacion: any = null; // Es la solicitud que se pasa como input a darTurnos
    operacionTurnos = '';
    showDarTurnos = false;
    showDashboard = true;
    showMostrarTurnosPaciente = false;
    showCreateUpdate = false;
    seleccion: IPaciente = null;
    esEscaneado = false;
    textoPacienteSearch = '';
    resultadoCreate;
    turnoArancelamiento: any;
    showArancelamiento = false;
    private esOperacion = false;
    listado: any;
    pacienteId: any;
    routeParams: any;

    constructor(
        private laboratorioContextoCacheService: LaboratorioContextoCacheService,
        public servicePaciente: PacienteService,
        public auth: Auth,
        public appMobile: AppMobileService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private plex: Plex) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:puntoInicio:?').length > 0;
        this.puedeDarTurno = this.puedeDarTurno && this.auth.getPermissions('turnos:puntoInicio:darTurnos:?').length > 0;
        this.puedeCrearSolicitud = this.puedeCrearSolicitud && this.auth.getPermissions('turnos:puntoInicio:solicitud:?').length > 0;

        this.routeParams = this.route.params.subscribe(params => {
            if (params['id'] && !this.seleccion) {
                this.pacienteId = params['id'];

                this.servicePaciente.getById(this.pacienteId).subscribe(pacienteMPI => {
                    this.onPacienteSelected(pacienteMPI);
                });
            }

        });
    }

    ngOnDestroy() {
        this.routeParams.unsubscribe(); // <-------
    }

    /**
     * Funcionalidades del buscador de MPI
     */
    searchStart() {
        this.listado = null;
        this.seleccion = null;
        this.router.navigate(['/laboratorio/recepcion/']);

    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.listado = resultado.pacientes;
        }
    }

    recepcionSinTurno() {
        // this.laboratorioContextoCacheService.modoRecepcionSinTurno();
        this.laboratorioContextoCacheService.modoRecepcion();
        this.router.navigate(['/laboratorio/protocolos/sinTurno/' + this.seleccion.id]);
    }

    showArancelamientoForm(turno) {
        this.turnoArancelamiento = turno;
        this.showDashboard = false;
        this.showArancelamiento = true;
    }

    volverAPuntoInicio() {
        this.showArancelamiento = false;
        this.showDashboard = true;
    }

    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.seleccion = paciente;

        if (paciente.id) {


            if (paciente.estado === 'temporal' && paciente.scan) {
                this.seleccion = paciente;
                if (paciente.scan) {
                    this.esEscaneado = true;
                }
                this.escaneado.emit(this.esEscaneado);
                this.selected.emit(this.seleccion);
                this.showCreateUpdate = true;
                this.showDarTurnos = false;
                this.showDashboard = false;
            } else {
                this.servicePaciente.getById(paciente.id).subscribe(
                    pacienteMPI => {
                        this.paciente = pacienteMPI;

                        this.showListaSolicitudes = true;

                        // Si el paciente previamente persistido no posee string de scan, y tenemos scan, actualizamos el pac.
                        if (!this.paciente.scan && paciente.scan) {
                            this.servicePaciente.patch(paciente.id, { op: 'updateScan', scan: paciente.scan }).subscribe();
                        }
                        this.showMostrarEstadisticasAgendas = false;
                        if (this.esOperacion) {
                            this.esOperacion = false;
                        } else {
                            this.showMostrarEstadisticasPacientes = true;
                            this.showMostrarTurnosPaciente = false;
                            this.showActivarApp = false;
                            this.showIngresarSolicitud = false;
                        }
                    });
            }

            // this.router.navigate(['/laboratorio/recepcion/' + paciente.id]);
            let url = this.router.createUrlTree(['/laboratorio/recepcion/' + paciente.id]).toString();
            // Change the URL without navigate:
            this.location.go(url);

        } else {
            this.showMostrarEstadisticasAgendas = false;
            this.showMostrarEstadisticasPacientes = false;
            this.showIngresarSolicitud = false;
            if (paciente.scan) {
                this.esEscaneado = true;
            }
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            this.showCreateUpdate = true;
            this.showDarTurnos = false;
            this.showDashboard = false;
        }
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.showActivarApp = false;
        this.showDashboard = true;
        this.showDarTurnos = false;
        if (paciente) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.selected.emit(this.paciente);
                    this.resultadoCreate = [pacienteMPI];
                    this.showMostrarEstadisticasAgendas = false;
                    this.showMostrarEstadisticasPacientes = true;
                    if (this.esOperacion) {
                        this.showMostrarEstadisticasPacientes = false;
                        this.esOperacion = false;
                    } else {
                        this.showMostrarTurnosPaciente = false;
                        this.showActivarApp = false;
                    }
                });
        } else {
            this.showDarTurnos = false;
        }
    }

    handleBlanqueo(event) {
        this.showMostrarEstadisticasAgendas = true;
        this.showMostrarEstadisticasPacientes = false;
        this.showMostrarTurnosPaciente = false;
        this.showIngresarSolicitud = false;
        this.showListaSolicitudes = false;
    }

    verificarOperacion({ operacion, paciente }) {

        this.esOperacion = true;
        this.showActivarApp = false;
        this.paciente = paciente;

        switch (operacion) {
            case 'darTurno':
                this.solicitudPrestacion = null;
                this.showDashboard = false;
                this.showMostrarTurnosPaciente = false;
                this.showIngresarSolicitud = false;
                this.showDarTurnos = true;
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
        if (this.paciente && this.paciente.id) {
            // this.onPacienteSelected(this.paciente);
            if (pac && pac.carpetaEfectores && pac.carpetaEfectores.length > 0) {
                this.paciente.carpetaEfectores = pac.carpetaEfectores;
            }
            this.selected.emit(this.paciente);
            this.resultadoCreate = [this.paciente];
        }
        this.showMostrarEstadisticasAgendas = false;
        this.showMostrarEstadisticasPacientes = true;
        this.showIngresarSolicitud = false;
        this.showMostrarTurnosPaciente = false;
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
            this.redirect('/laboratorio/recepcion');
        } else {
            this.redirect('dashboard_codificacion');
        }
    }

    /**
     *
     *
     * @param {*} event
     * @memberof PuntoInicioLaboratorioComponent
     */
    darTurnoSolicitud(event) {
        this.solicitudPrestacion = event;
        this.showDarTurnos = true;
        this.showDashboard = false;
    }

    /**
     *
     *
     * @param {string} pagina
     * @returns
     * @memberof PuntoInicioLaboratorioComponent
     */
    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /**
     *
     *
     * @param {*} $event
     * @memberof PuntoInicioLaboratorioComponent
     */
    seleccionarProtocolo($event) {
        this.seleccionarProtocoloEmitter.emit($event);
    }

    /**
     *
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    recepcionarSinTurno($paciente) {
        this.pacienteSinTurnoEmitter.emit($paciente);
    }
}
