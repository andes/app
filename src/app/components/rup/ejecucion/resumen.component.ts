import { IPrestacion } from './../../../interfaces/turnos/IPrestacion';
import { IProblemaPaciente } from '../../../interfaces/rup/IProblemaPaciente';
import { PrestacionPacienteService } from '../../../services/rup/prestacionPaciente.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

import { IPrestacionPaciente } from '../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from '../../../interfaces/IPaciente';
import { ProblemaPacienteService } from '../../../services/rup/problemaPaciente.service';

@Component({
    selector: 'rup-resumen',
    templateUrl: 'resumen.html'
})
export class ResumenComponent implements OnInit {

    @Input() prestacion: IPrestacionPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    paciente: IPaciente;
    // prestacion: IPrestacionPaciente;
    idPrestacion: String;
    listaProblemas: IProblemaPaciente[] = [];
    prestacionesPendientes: IPrestacionPaciente[] = [];
    prestacionPeso: IPrestacionPaciente = null;
    prestacionTalla: IPrestacionPaciente = null;

    showEjecucion = false;

    constructor(private servicioProblemasPaciente: ProblemaPacienteService,
        private servicioPrestacionPaciente: PrestacionPacienteService) {

    }

    ngOnInit() {
        this.loadProblemas();
        this.loadPrestacionesPendientes();
        this.cargarIndicadores();
    }

    loadProblemas() {
        this.servicioProblemasPaciente.get({ idPaciente: this.prestacion.paciente.id }).subscribe(problemas => {
            this.listaProblemas = problemas;
        });
    }

    loadPrestacionesPendientes() {
        this.servicioPrestacionPaciente.get({ estado: "pendiente", idPaciente: this.prestacion.paciente.id, limit: 10 })
            .subscribe(prestaciones => {
                this.prestacionesPendientes = prestaciones;
            });
    }

    cargarIndicadores() {
        this.servicioPrestacionPaciente.getByKey("signosVitales.peso")
            .subscribe(prestacion => {
                if (prestacion)
                    this.prestacionPeso = prestacion[0];
            });

        this.servicioPrestacionPaciente.getByKey("talla")
            .subscribe(prestacion => {
                if (prestacion)
                    this.prestacionTalla = prestacion[0];
            });
    }

    iniciarPrestacion() {
        this.prestacion.estado.push({
            timestamp: new Date(),
            tipo: 'ejecucion'
        });

        this.servicioPrestacionPaciente.put(this.prestacion).subscribe(prestacion => {
            //this.prestacion = prestacion;
            this.showEjecucion = true;
        });

    }

    verPrestacion() {
        this.showEjecucion = true;
    }

    volver() {
        this.showEjecucion = false;
        this.evtData.emit(null);
    }
}