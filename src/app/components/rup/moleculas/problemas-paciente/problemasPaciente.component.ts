import { ProblemaPacienteService } from './../../../../services/rup/ProblemaPaciente.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IPaciente } from './../../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../../interfaces/rup/IProblemaPaciente';


@Component({
    selector: 'rup-problemasPaciente',
    templateUrl: 'problemasPaciente.html'
})
export class ProblemasPacienteComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    //@Input('paciente') paciente: any;
    paciente: any; // será un IPaciente

    // resultados a devolver
    data: Object = {};
    listaProblemas: IProblemaPaciente[] = [];


    constructor(private servicioProblemaPaciente: ProblemaPacienteService) {

    }


    ngOnInit() {
        // debugger;
        this.paciente = {
            "id": "57ebacce69fe79a598e6281d",
            "documento": "29410428",
            "activo": true,
            "estado": "validado",
            "nombre": "Carolina",
            "apellido": "Celeste",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": "02/11/1993",
            "estadoCivil": "soltera"
        };

        this.loadProblemas();

    }

    loadProblemas() {
        this.servicioProblemaPaciente.get({ idPaciente: this.paciente.id }).subscribe(resultado => {
            this.listaProblemas = resultado;
        });
    }


    onReturn(valor: Number, tipoPrestacion: any) {
        this.data[this[tipoPrestacion].key] = valor;
        this.evtData.emit(this.data);
    }


}