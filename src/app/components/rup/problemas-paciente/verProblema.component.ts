import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-verProblemaPaciente',
    templateUrl: 'verProblema.html'
})
export class verProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    problema: any;

    constructor(private servicioProblemaPaciente: ProblemaPacienteService, private route: ActivatedRoute) {

    }


    ngOnInit() {
        debugger;
        this.route.params.forEach((params: Params) => {
            debugger;
            if (params['id']) {
                let id = params['id'];
                this.servicioProblemaPaciente.getById(id)
                    .subscribe(problema => { debugger; this.problema = problema });
            }


        });
    }


}