import { PrestacionService } from './../../../services/turnos/prestacion.service';
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
    nuevoTipoPrestacion: ITipoPrestacion; // utilizado para el select
    nuevaPrestacionListaProblemas: any = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];
    // lista de problemas al mostrar cuando pedimos una nueva prestacion en el plan
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
        console.log(this.prestacion);
    }

    buscarTipoPrestacion(event) {
        this.serviceTipoPrestacion.get(event.query).subscribe(event.callback);
    }

    agregarPrestacionFutura() {
        if (this.nuevoTipoPrestacion) {

            // asignamos valores a la nueva prestacion
            this.nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.paciente.id,
                solicitud: {
                    tipoPrestacion: this.nuevoTipoPrestacion,
                    fecha: new Date(),
                    listaProblemas: []
                },
                estado: {
                    timestamp: Date(),
                    tipo: 'pendiente'
                }
            };

            // si he agregado algun problema a la nueva prestacion
            // entonces asigno su id a la prestacion a guardar
            if (this.nuevaPrestacionListaProblemas && this.nuevaPrestacionListaProblemas.length){
                // inicializamos el array en caso de que haga falta
                // if (typeof this.nuevaPrestacion.solicitud.listaProblemas === 'undefined') {
                //     this.nuevaPrestacion.solicitud.listaProblemas = [];
                // }
                // recorremos array de problemas y asignamos a la nueva prestacion
                for (let problema of this.nuevaPrestacionListaProblemas) {
                    this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
                }
            }

            // guardamos la nueva prestacion 
            this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {
                // this.prestacionesFuturas.push(prestacionFutura);

                // asignamos la prestacion nueva al array de prestaciones futuras
                this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);

                // actualizamos la prestacion de origen
                this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
                    // this.prestacion = prestacionActualizada;
                    // buscamos la prestacion actualizada con los datos populados
                    this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                        console.log(prestacion);
                        this.prestacion = prestacion;
                    });
                });
            });

            this.nuevoTipoPrestacion = null;
            this.nuevaPrestacionListaProblemas = [];
        } else {
            this.plex.alert('Debe seleccionar una prestación');
        }
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