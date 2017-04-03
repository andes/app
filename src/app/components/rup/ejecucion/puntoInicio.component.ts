import { AgendaService } from './../../../services/turnos/agenda.service';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';

import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})
export class PuntoInicioComponent implements OnInit {

    //Input del profesiona logueado.
    //@Input() profesionalLog: any;
    public profesionalLog: any;
    public listaPrestaciones: IPrestacionPaciente[] = [];
    public prestacionSeleccionada: IPrestacionPaciente = null; // será un IPaciente

    public showPendientes = true;
    public showDashboard = false;
    public enEjecucion = false;

    public agendas: any = [];
    public fechaActual = new Date();
    public bloqueSeleccionado: any;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioProblemasPaciente: ProblemaPacienteService,
        public servicioAgenda: AgendaService,
        private router: Router) {

    }


    ngOnInit() {

        this.profesionalLog = {
            'id': '57fe1dafe46ceaf8317c7ddf',
            'nombre': 'Sara',
            'apellido': 'Connor',
            'activo': true,
        }
        this.loadAgendasXDia();

    }

    loadAgendasXDia() {

        var fechaDesde = this.fechaActual.setHours(0, 0, 0, 0)
        var fechaHasta = this.fechaActual.setHours(23, 59, 0, 0);
        this.servicioAgenda.get({
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            idProfesional: this.profesionalLog.id
        }).subscribe(
            agendas => { this.agendas = agendas; },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    listadoTurnos(bloque) {
        this.bloqueSeleccionado = bloque;
        let turnos = this.bloqueSeleccionado.turnos.map(elem => { return elem.id; });

        this.servicioPrestacion.get({ turnos: turnos }).subscribe(resultado => {
            this.listaPrestaciones = resultado;
        })

    }

    elegirPrestacion(prestacion: IPrestacionPaciente) {
        debugger;
        this.prestacionSeleccionada = prestacion;
        this.showPendientes = false;
        this.showDashboard = true;
    }

    onReturn() {
        this.showPendientes = true;
        this.showDashboard = false;
    }

}