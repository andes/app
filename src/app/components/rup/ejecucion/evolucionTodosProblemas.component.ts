import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-evolucionaProblemasTodos',
    templateUrl: 'evolucionTodosProblemas.html'
})
export class EvolucionTodosProblemasComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente[]> = new EventEmitter<IProblemaPaciente[]>();
    @Input() problemas: IProblemaPaciente[];
    textoEvolucion: String = "";


    constructor(private servProbPaciente: ProblemaPacienteService,
        public plex: Plex) { }


    ngOnInit() {
        debugger;
    }

    evolucionar() {
        let cant = this.problemas.length;
        for (let i = 0; i < cant; i++) {
            var dato = {
                fecha: new Date(),
                activo: this.problemas[i].activo,
                observacion: this.textoEvolucion,
                profesional: null, //TODO: traer profesional login
                organizacion: null //TODO: traer organizacion login
            }
            this.problemas[i].evoluciones.push(dato);
        }

        this.servProbPaciente.putAll(this.problemas).subscribe(resultado => {
            if (resultado) {
                debugger;
                this.evtData.emit(this.problemas);
            } else {
                this.plex.alert('Ha ocurrido un error al almacenar la evolución de los problemas');
            }

        });




    }

    cerrar() {
        this.evtData.emit(this.problemas);
    }

}