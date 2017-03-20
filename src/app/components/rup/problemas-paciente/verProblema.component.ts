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

    @Input() problema: IProblemaPaciente;
    public evoluciones: any[];

    constructor(private servicioProblemaPaciente: ProblemaPacienteService, private route: ActivatedRoute) {

    }


    ngOnInit() {
        console.log(this.problema);
        this.servicioProblemaPaciente.getById(this.problema.id)
            .subscribe(problema => {
                this.problema = problema;
                console.log("problema populado", this.problema);
            });
        debugger;
        // this.route.params.forEach((params: Params) => {
        //     debugger;
        //     if (params['id']) {
        //         let id = params['id'];
        //         this.servicioProblemaPaciente.getById(id)
        //             .subscribe(problema => {
        //                 this.problema = problema;
        //             });
        //     }
        // });


    }

    cerrar() {
        this.evtData.emit(null);
    }
}
