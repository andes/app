import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

// Interfaces
import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { PacienteService } from '../../../services/paciente.service';
// import { AgendaService } from '../../../services/turnos/agenda.service';
import { AppMobileService } from '../../../services/appMobile.service';

@Component({
    selector: 'puntoInicio-turnos',
    templateUrl: 'puntoInicio-turnos.html'
})

export class PuntoInicioTurnosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

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
    solicitudPrestacion: any = null; // Es la solicitud que se pasa como input a darTurnos
    operacionTurnos = '';
    showDarTurnos = false;
    showDashboard = true;
    showMostrarTurnosPaciente = false;
    showCreateUpdate = false;
    seleccion = null;
    esEscaneado = false;
    textoPacienteSearch = '';
    resultadoCreate;
    turnoArancelamiento: any;
    showArancelamiento = false;
    private esOperacion = false;


    constructor(
        public servicePaciente: PacienteService,
        public auth: Auth,
        public appMobile: AppMobileService,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:puntoInicio:?').length > 0;
        this.puedeDarTurno = this.auth.getPermissions('turnos:puntoInicio:darTurnos:?').length > 0;
        this.puedeCrearSolicitud = this.auth.getPermissions('turnos:puntoInicio:solicitud:?').length > 0;
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
        } else {
            this.showMostrarEstadisticasAgendas = false;
            this.showMostrarEstadisticasPacientes = false;
            this.showIngresarSolicitud = false;
            this.seleccion = paciente;
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

}
