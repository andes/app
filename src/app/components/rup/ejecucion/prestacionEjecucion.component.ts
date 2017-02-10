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
    data: Object = {};
    prestacionSignosVitales: any;
    prestacionTalla: any;

    // objeto para crear una nueva prestacion y asignar al array de prestaciones futuras
    nuevaPrestacion: any;
    nuevoTipoPrestacion: ITipoPrestacion; // utilizado para el select
    nuevaPrestacionListaProblemas: any = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];
    // lista de problemas al mostrar cuando pedimos una nueva prestacion en el plan
    problemasPrestaciones: any = {};

    listaProbPrestacion = {
        talla: [],
        signosVitales: []
    }

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) {
    }

    ngOnInit() {
        // debugger;
        this.prestacionSignosVitales = {
            'id': '5891e543159eb45d71236e52',
            'key': 'signosVitales',
            'nombre': 'Signos Vitales',
            'autonoma': false,
            'activo': true,
            'ejecucion': [
                '589073500c4eccd05d2a7a44',
                '5890c8aa7358af394f6d52d6',
                '5890c8f77358af394f6d52d7',
                '5890c92c7358af394f6d52d8',
                '5890c93f7358af394f6d52d9',
                '5890ca047358af394f6d52dc'
            ],
            'componente': 'rup/signos-vitales/signosVitales.component.ts'
        };

        this.prestacionTalla = {
            'id': '5890c94d7358af394f6d52da',
            'key': 'talla',
            'nombre': 'Talla',
            'autonoma': false,
            'activo': true,
            'componente': 'rup/talla.component.ts'
        }
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

               this.updatePrestacion();
            });

            this.nuevoTipoPrestacion = null;
            this.nuevaPrestacionListaProblemas = [];
        } else {
            this.plex.alert('Debe seleccionar una prestación');
        }
    }

    updatePrestacion(){
         // actualizamos la prestacion de origen
        this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
            // this.prestacion = prestacionActualizada;
            // buscamos la prestacion actualizada con los datos populados
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
        });
    }

    borrarPrestacionFutura(index) {
        this.prestacionesFuturas.splice(index, 1);
    }

    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre == tipoProblema.nombre)
    }


    guardarProblema(nuevoProblema) {
        //debugger;
        console.log(this.listaProblemas);
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            //debugger;
            if (resultado) {
                this.listaProblemas.push(resultado);

                // asignamos el problema a la prestacion de origen
                // this.prestacion.solicitud.listaProblemas.push(resultado);
                this.updatePrestacion();
            } else {
                this.plex.alert('Error al intentar asociar el problema a la consulta');
            }
        });
    }

    agregarProblema() {
        //debugger;
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
            //debugger;
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


    onReturnValores(valor: Number, tipoPrestacion: any) {
        let valoresPrestacion = {};
        valoresPrestacion[tipoPrestacion.key]= valor;

        this.data[tipoPrestacion.key] = valoresPrestacion;
        console.log(this.data);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }

    evolucionarPrestacion(tipoPrestacion){
        // asignamos valores a la nueva prestacion
            this.nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.paciente.id,
                solicitud: {
                    tipoPrestacion: tipoPrestacion,
                    fecha: new Date(),
                    listaProblemas: []
                },
                estado: {
                    timestamp: new  Date(),
                    tipo: 'ejecucion'
                },
                ejecucion: {
                    fecha: new Date(),
                    evoluciones: [{
                        valores: this.data[tipoPrestacion.key],
                        estado: [{
                            timestamp: new Date(),
                            tipo: 'ejecucion'
                        }]
                    }]
                }
            };

            // si he agregado algun problema a la nueva prestacion
            // entonces asigno su id a la prestacion a guardar
            if (this.listaProbPrestacion[tipoPrestacion.key] && this.listaProbPrestacion[tipoPrestacion.key].length){
                // inicializamos el array en caso de que haga falta
                // if (typeof this.nuevaPrestacion.solicitud.listaProblemas === 'undefined') {
                //     this.nuevaPrestacion.solicitud.listaProblemas = [];
                // }
                // recorremos array de problemas y asignamos a la nueva prestacion
                for (let problema of this.listaProbPrestacion[tipoPrestacion.key]) {
                    this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
                }
            }

            console.log(this.nuevaPrestacion);

            // // guardamos la nueva prestacion 
            this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {
                // this.prestacionesFuturas.push(prestacionFutura);
                this.plex.alert('Prestacion confirmada');

            });
    }


}