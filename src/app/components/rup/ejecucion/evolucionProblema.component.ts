import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/ProblemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-evolucionaProblema',
    templateUrl: 'evolucionProblema.html'
})
export class EvolucionProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente> = new EventEmitter<IProblemaPaciente>();

    @Input() problema: IProblemaPaciente;
    textoEvolucion: String = "";


    constructor(private servProbPaciente: ProblemaPacienteService,
        public plex: Plex) { }


    ngOnInit() {
        debugger;
    }

    evolucionarProblema() {
        var dato = {
            fecha: new Date(),
            activo: true,
            observacion: this.textoEvolucion,
            profesional: null,
            organizacion: null
        }
        this.problema.evoluciones.push(dato);
        this.servProbPaciente.put(this.problema).subscribe(resultado => {
            if (resultado) {
                this.evtData.emit(this.problema);
            } else {
                this.plex.alert('Ha ocurrido un error al almacenar la evolución');
            }

        });




    }

    cerrar() {
        this.evtData.emit(this.problema);
    }

}