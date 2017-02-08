import { TipoPrestacionService } from './../../../services/rup/tipoPrestacion.service';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';

import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/ProblemaPaciente.service';

import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html'
})
export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    @Input() prestacion: IPrestacionPaciente;
    listaProblemas: IProblemaPaciente[] = null;
    problemaBuscar: String = "";
    paciente: IPaciente = null;

    // objeto para crear una nueva prestacion y asignar al array de prestaciones futuras
    nuevaPrestacion: any;
    nuevoTipoPrestacion: ITipoPrestacion;
    nuevaPrestacionListaProblemas: any;
    // nuevasPrestaciones: IPrestacionPaciente[] = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];
    // lista de problemas al mostrar cuando pedimos una prestacion en el plan
    problemasPrestaciones: any = {};

    constructor(private servicioPrestacion: PrestacionPacienteService, private serviceTipoPrestacion: TipoPrestacionService) {

    }

    ngOnInit() {
        // debugger;
        this.cargarDatosPrestacion();
    }

    cargarDatosPrestacion() {
        // debugger;
        this.listaProblemas = this.prestacion.solicitud.listaProblemas;
        this.paciente = this.prestacion.paciente;

        // preparamos el array con los datos de los problemas como lo necesita plex-select
        this.problemasPrestaciones = this.prestacion.solicitud.listaProblemas.map(function(problema){
            return {
                id: problema.id,
                nombre: problema.tipoProblema.nombre
            };
        });
    }

    buscarTipoPrestacion(event) {
        this.serviceTipoPrestacion.get(event.query).subscribe(event.callback);
    }

    agregarPrestacionFutura(){
        // asignamos valores a la nueva prestacion
        this.nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.paciente,
            solicitud: {
                tipoPrestacion: this.nuevoTipoPrestacion,
                fecha: new Date(),
                listaProblemas : this.nuevaPrestacionListaProblemas.filter(function(problema){
                    return problema.id
                })
            }
        };

        // asignamos la nueva prestacion al array de prestacionesSolicitadas de la prestacion origen
        this.prestacionesFuturas.push(this.nuevaPrestacion);

        this.nuevoTipoPrestacion = null;
        this.nuevaPrestacionListaProblemas = [];
    }

    borrarPrestacionFutura(index){
        this.prestacionesFuturas.splice(index, 1);
    }
}