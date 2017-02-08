import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

import { IPrestacionPaciente } from '../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from '../../interfaces/IPaciente';
import { ProblemaPacienteService } from './../../services/rup/problemaPaciente.service';

@Component({
    selector: 'rup-dashboard',
    templateUrl: 'dashboard.html'
})
export class DashboardComponent implements OnInit {

    @Input() prestacion: IPrestacionPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    paciente: IPaciente;

    constructor(private servicioProblemasPaciente: ProblemaPacienteService) {

    }

    ngOnInit() {
        console.log(this.prestacion);
        this.paciente = this.prestacion.paciente;

        let params = {params: {idPaciente: this.prestacion.paciente.id}};

        this.servicioProblemasPaciente.get(params).subscribe(function(data){
            this.listaProblemas = data;
        });


    }

    iniciarPrestacion(){

    }
}