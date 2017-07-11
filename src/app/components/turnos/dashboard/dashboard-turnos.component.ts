import { Component, AfterViewInit, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

// Interfaces
import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import { IPaciente } from '../../../interfaces/IPaciente';

// Servicios
import { PacienteService } from '../../../services/paciente.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { AppMobileService } from '../../../services/appMobile.service';

@Component({
    selector: 'dashboard-turnos',
    templateUrl: 'dashboard-turnos.html'
})

export class DashboardTurnosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

    public alerta = false;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;
    public showMostrarEstadisticasAgendas = true;
    public showMostrarEstadisticasPacientes = false;
    public showActivarApp = false;
    public paciente;
    public autorizado = false;
    operacionTurnos = '';
    showDarTurnos = false;
    showDashboard = true;
    showMostrarTurnosPaciente = false;
    showCreateUpdate = false;
    seleccion = null;
    esEscaneado = false;
    private esOperacion = false;
    textoPacienteSearch = '';
    resultadoCreate;


    constructor(
        public servicePaciente: PacienteService,
        public servicioAgenda: AgendaService, public auth: Auth,
        public appMobile: AppMobileService,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
    }

    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        if (paciente.id) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.showMostrarEstadisticasAgendas = false;
                    // this.showMostrarEstadisticasPacientes = true;
                    if (this.esOperacion) {
                        this.esOperacion = false;
                    } else {
                        this.showMostrarEstadisticasPacientes = true;
                        this.showMostrarTurnosPaciente = true;
                    }
                });
        } else {
            this.showMostrarEstadisticasAgendas = false;
            this.showMostrarEstadisticasPacientes = false;
            this.seleccion = paciente;
            this.esEscaneado = true;
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            this.showCreateUpdate = true;
            this.showDarTurnos = false;
            this.showDashboard = false;
        }
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
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
    }

    verificarOperacion({ operacion, paciente }) {
        this.esOperacion = true;
        this.showActivarApp = false;
        switch (operacion) {
            case 'darTurno':
                this.showDarTurnos = true;
                this.showDashboard = false;
                this.showMostrarTurnosPaciente = false;
                break;
            case 'anulacionTurno':
                this.showMostrarEstadisticasAgendas = false;
                this.showMostrarEstadisticasPacientes = false;
                this.operacionTurnos = 'anulacionTurno';
                this.showMostrarTurnosPaciente = true;
                break;
            case 'registrarAsistencia':
                this.showMostrarEstadisticasAgendas = false;
                this.showMostrarEstadisticasPacientes = false;
                this.operacionTurnos = 'registrarAsistencia';
                this.showMostrarTurnosPaciente = true;
                break;
            case 'activarApp':
                this.paciente = paciente;
                this.showMostrarEstadisticasAgendas = false;
                this.showMostrarEstadisticasPacientes = false;
                this.showMostrarTurnosPaciente = false;
                this.showActivarApp = true;
                break;
        }
    }

    actualizarPaciente(actualizar) {
        this.showCreateUpdate = actualizar;
        this.showDashboard = !actualizar;
    }

    cancelarDarTurno() {
        this.showDarTurnos = false;
        this.showDashboard = true;
        this.showMostrarEstadisticasAgendas = true;
        this.showMostrarEstadisticasPacientes = false;
        this.showMostrarTurnosPaciente = false;
    }

}
