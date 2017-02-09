import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/rup/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
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
    listaProblemas: IProblemaPaciente[] = [];
    problemaBuscar: String = "";
    tiposProblemas = [];
    tipoProblema = null
    paciente: IPaciente = null;
    showEvolucionar = false;
    showEvolTodo = false;
    problemaEvolucionar: any;


    // objeto para crear una nueva prestacion y asignar al array de prestaciones futuras
    nuevaPrestacion: any;
    nuevoTipoPrestacion: ITipoPrestacion;
    nuevaPrestacionListaProblemas: any;
    // nuevasPrestaciones: IPrestacionPaciente[] = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];
    // lista de problemas al mostrar cuando pedimos una prestacion en el plan
    problemasPrestaciones: any = {};

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) {
    }

    ngOnInit() {
        // debugger;
        this.cargarDatosPrestacion();
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    cargarDatosPrestacion() {
        // debugger;
        this.listaProblemas = this.prestacion.solicitud.listaProblemas;
        this.paciente = this.prestacion.paciente;

        // preparamos el array con los datos de los problemas como lo necesita plex-select
        this.problemasPrestaciones = this.prestacion.solicitud.listaProblemas.map(function (problema) {
            return {
                id: problema.id,
                nombre: problema.tipoProblema.nombre
            };
        });
    }


    buscarTipoPrestacion(event) {
        this.serviceTipoPrestacion.get(event.query).subscribe(event.callback);
    }

    agregarPrestacionFutura() {
        // asignamos valores a la nueva prestacion
        this.nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.paciente,
            solicitud: {
                tipoPrestacion: this.nuevoTipoPrestacion,
                fecha: new Date(),
                listaProblemas: this.nuevaPrestacionListaProblemas.filter(function (problema) {
                    return problema.id
                })
            }
        };

        // asignamos la nueva prestacion al array de prestacionesSolicitadas de la prestacion origen
        this.prestacionesFuturas.push(this.nuevaPrestacion);

        this.nuevoTipoPrestacion = null;
        this.nuevaPrestacionListaProblemas = [];
    }

    borrarPrestacionFutura(index) {
        this.prestacionesFuturas.splice(index, 1);
    }

    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre == tipoProblema.nombre)
    }


    guardarProblema(nuevoProblema) {
        debugger;
        console.log(this.listaProblemas);
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            debugger;
            if (resultado) {
                this.listaProblemas.push(resultado);
            } else {
                this.plex.alert('Error al intentar asociar el problema a la consulta');
            }
        });
    }

    agregarProblema() {
        debugger;
        if (!this.existeProblema(this.tipoProblema)) {
            let nuevoProblema = {
                id: null,
                tipoProblema: this.tipoProblema,
                idProblemaOrigen: null,
                paciente: this.paciente,
                fechaInicio: new Date(),
                activo: true,
                evoluciones: []
            };

            this.guardarProblema(nuevoProblema);

        } else {
            this.plex.alert('EL problema ya existe para esta consulta');
        }
    }

    eliminarProblema(problema: IProblemaPaciente) {
        this.plex.confirm('Está seguro que desea eliminar el problema: ' + problema.tipoProblema.nombre + ' de la consulta actual?').then(resultado => {
            debugger;
            if (resultado) {

            }
        });
    }

    evolucionarProblema(problema) {
        this.showEvolucionar = true;
        this.problemaEvolucionar = problema;

    }

    evolucionarTodo() {
        this.showEvolucionar = false;
        this.showEvolTodo = true;
    }

    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
        console.log(dato);
    }

    onReturnTodos(dato: IProblemaPaciente[]) {
        this.showEvolucionar = false;
        this.showEvolTodo = false;
    }
}