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
import { PacienteSearch } from '../../../services/pacienteSearch.interface';
import { PacienteService } from '../../../services/paciente.service';
import { AgendaService } from '../../../services/turnos/agenda.service';


@Component({
    selector: 'dashboard-turnos',
    templateUrl: 'dashboard-turnos.html'
})

export class DashboardTurnosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;


    public alerta = false;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;
    public showMostrarEstadisticasAgendas = true;
    public showMostrarEstadisticasPacientes = true;
    public paciente;
    public searchTerm= '';
    private buscarMPI = true;

    constructor(
        public servicePaciente: PacienteService,
        public servicioAgenda: AgendaService, public auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

    }

    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.showMostrarEstadisticasAgendas = false;
        this.showMostrarEstadisticasPacientes = true;
        debugger;
        if (paciente.id) {
            this.searchTerm = '';
            this.buscarMPI = false;
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.searchTerm = '';
                    window.setTimeout(() => this.buscarMPI = true, 100);
                });
        }

        // this.buscarMPI = false;
    }

    handleBlanqueo(event) {
        this.searchTerm = '';
        //this.buscarMPI = false;
    }

}
