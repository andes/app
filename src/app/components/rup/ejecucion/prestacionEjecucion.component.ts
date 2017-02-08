import { Plex } from 'andes-plex/src/lib/core/service';

import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/ProblemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html'
})
export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    @Input() prestacion: IPrestacionPaciente;
    listaProblemas: IProblemaPaciente[] = [];
    problemaBuscar: String = "";
    tiposProblemas = [];
    tipoProblema = null
    paciente: IPaciente = null;
    showEvolucionar = false;
    problemaEvolucionar: any;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioTipoProblema: TipoProblemaService,
        public plex: Plex) {

    }


    ngOnInit() {
        debugger;
        this.cargarDatosPrestacion();
        this.servicioTipoProblema.get({}).subscribe(res => {
            debugger;
            this.tiposProblemas = res
            //this.tipoProblema = this.tiposProblemas[0];
        });

    }



    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    cargarDatosPrestacion() {
        debugger;
        this.listaProblemas = this.prestacion.solicitud.listaProblemas;
        this.paciente = this.prestacion.paciente;
    }

    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre == tipoProblema.nombre)
    }

    agregarProblema() {
        debugger;
        if (this.existeProblema(this.tipoProblema)) {
            let nuevoProblema = {
                id: null,
                tipoProblema: this.tipoProblema,
                idProblemaOrigen: null,
                paciente: this.paciente,
                fechaInicio: new Date(),
                evoluciones: null
            };
            this.listaProblemas.push(nuevoProblema);

        } else {
            this.plex.alert('EL problema ya existe para esta consulta');
        }


    }


    evolucionarProblema(problema) {
        this.showEvolucionar = true;
        this.problemaEvolucionar = problema;

    }

    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
        console.log(dato);
    }

    onReturnTodos(dato: IProblemaPaciente[]) {
    }

}