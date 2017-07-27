import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Auth } from '@andes/auth';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-verProblemaPaciente',
    templateUrl: 'verProblema.html'
})
export class VerProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    @Input() problema: IProblemaPaciente;
    public evoluciones: any[];
    // public usuario: IPaciente;

    constructor(private servicioProblemaPaciente: ProblemaPacienteService, public auth: Auth, private route: ActivatedRoute) {

    }


    ngOnInit() {
        this.servicioProblemaPaciente.getById(this.problema.id)
            .subscribe(problema => {
                this.problema = problema;

                this.problema.evoluciones.sort(function(a, b){
                    if ( a.fecha > b.fecha ) {
                        return -1;
                    }

                    if ( a.fecha < b.fecha ) {
                        return 1;
                    }

                    return 0;
                });
            });


    }

    cerrar() {
        this.evtData.emit(null);
    }
}
