import { PrestacionService } from './../../../services/turnos/prestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
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
    problemaEvolucionar: any;

    showEvolucionar = false;
    showEvolTodo = false;
    showValidar = false;
    data: Object = {};

    // array de id prestaciones que se ejecutaron en la consulta 
    prestacionesEjecucion: any[] = [];
    prestacionesEjecutar: any[] = [];
    prestacionAEjecutar: any = null;
    // nuevas prestaciones a ejecutar en la consulta 
    nuevasPrestaciones: ITipoPrestacion[] = [];

    // objeto para crear una nueva prestacion y asignar al array de prestaciones futuras
    nuevaPrestacion: any;
    nuevoTipoPrestacion: ITipoPrestacion; // utilizado para el select
    nuevaPrestacionListaProblemas: any = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];
    // lista de problemas al mostrar cuando pedimos una nueva prestacion en el plan
    problemasPrestaciones: any = {};

    listaProblemaPrestacion = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) {
    }

    ngOnInit() {
        this.cargarDatosPrestacion();
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    cargarDatosPrestacion() {
        this.listaProblemas = this.prestacion.solicitud.listaProblemas;

        // preparamos el array con los datos de los problemas como lo necesita plex-select
        this.problemasPrestaciones = this.prestacion.solicitud.listaProblemas.map(function (problema) {
            return {
                id: problema.id,
                nombre: problema.tipoProblema.nombre
            };
        });

        console.log(this.prestacion);

        // agregamos los ids de las prestaciones al array de prestaciones en ejecucion 
        // para luego poder filtrar y agregar nuevas prestaciones evitando duplicados
        this.prestacionesEjecucion.push(this.prestacion.solicitud.tipoPrestacion.id);

        // recorremos todas las prestaciones que vienen en la ejecucion de la prestacion de origen
        // y la agregamos a la lista de prestaciones a omitir en el select
        if (this.prestacion.solicitud.tipoPrestacion.ejecucion) {
            let length = this.prestacion.solicitud.tipoPrestacion.ejecucion.length;
            for (let i = 0; i < length; i++) {
                this.prestacionesEjecucion.push(this.prestacion.solicitud.tipoPrestacion.ejecucion[i].id);
            }
        }

        // this.serviceTipoPrestacion.get({excluir: this.prestacionesEjecucion}).subscribe(tiposPrestaciones => {
        //     this.prestacionesEjecutar = tiposPrestaciones;
        // });
    }

    posiblesPrestaciones(event) {
        this.serviceTipoPrestacion.get({ excluir: this.prestacionesEjecucion }).subscribe(event.callback);
    }

    agregarPrestacion(tipoPrestacion) {
        this.nuevasPrestaciones.push(tipoPrestacion);
        this.prestacionesEjecucion.push(tipoPrestacion.id);
        this.prestacionAEjecutar = null;
    }

    // Prestaciones futuras / Plan
    // Busca los tipos de prestaciones que pueda pedir a futuro como plan
    buscarTipoPrestacion(event) {
        this.serviceTipoPrestacion.get(event.query).subscribe(event.callback);
    }

    // agregamos la prestacion al plan
    agregarPrestacionFutura() {
        if (this.nuevoTipoPrestacion) {

            // asignamos valores a la nueva prestacion
            this.nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.prestacion.paciente.id,
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
            if (this.nuevaPrestacionListaProblemas && this.nuevaPrestacionListaProblemas.length) {
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
                //this.prestacionesFuturas.push(prestacionFutura);

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

    // borramos la prestacion del plan
    borrarPrestacionFutura(index) {
        this.prestacionesFuturas.splice(index, 1);
    }
    // Fin prestaciones futuras / Plan

    updatePrestacion() {
        // actualizamos la prestacion de origen
        this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
            // this.prestacion = prestacionActualizada;
            // buscamos la prestacion actualizada con los datos populados
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
        });
    }


    // lista de problemas
    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre == tipoProblema.nombre)
    }


    guardarProblema(nuevoProblema) {
        //debugger;
        //console.log(this.listaProblemas);
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            //debugger;
            if (resultado) {
                this.listaProblemas.push(resultado);
                this.problemasPrestaciones.push(resultado);

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
                paciente: this.prestacion.paciente,
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

    // Fin lista de problemas 
    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
    }


    onReturnTodos(dato: IProblemaPaciente[]) {
        this.showEvolucionar = false;
        this.showEvolTodo = false;
    }


    onReturnValores(valor: Number, tipoPrestacion: any) {
        let valoresPrestacion = {};
        valoresPrestacion[tipoPrestacion.key] = valor;

        this.data[tipoPrestacion.key] = valoresPrestacion;

    }

    onReturnComponent(datos, tipoPrestacionActual) {
        console.log("dato del componente", datos);
        this.data[tipoPrestacionActual.key] = datos;
    }

    evolucionarPrestacion(tipoPrestacionActual) {
        // console.log("en confirmacion", this.data[tipoPrestacionActual.key]);

        // asignamos valores a la nueva prestacion
        this.nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.prestacion.paciente.id,
            solicitud: {
                tipoPrestacion: tipoPrestacionActual,
                fecha: new Date(),
                listaProblemas: []
            },
            estado: {
                timestamp: new Date(),
                tipo: 'ejecucion'
            },
            ejecucion: {
                fecha: new Date(),
                evoluciones: [{
                    valores: this.data[tipoPrestacionActual.key],
                    estado: [{
                        timestamp: new Date(),
                        tipo: 'ejecucion'
                    }]
                }]
            }
        };

        // si he agregado algun problema a la nueva prestacion
        // entonces asigno su id a la prestacion a guardar
        if (this.listaProblemaPrestacion[tipoPrestacionActual.key] && this.listaProblemaPrestacion[tipoPrestacionActual.key].length) {
            // inicializamos el array en caso de que haga falta
            // if (typeof this.nuevaPrestacion.solicitud.listaProblemas === 'undefined') {
            //     this.nuevaPrestacion.solicitud.listaProblemas = [];
            // }
            // recorremos array de problemas y asignamos a la nueva prestacion
            for (let problema of this.listaProblemaPrestacion[tipoPrestacionActual.key]) {
                this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
            }
        }

        console.log(this.nuevaPrestacion);

        // // guardamos la nueva prestacion 
        this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {

            // asignamos la prestacion nueva al array de prestaciones futuras
            this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);

            // this.prestacionesFuturas.push(prestacionFutura);
            this.plex.alert('Prestacion confirmada');

        });
    }

    validarPrestacion() {
        this.showValidar = true;
    }


    onReturnComponente(datos, tipoPrestacionActual) {

        console.log("dato del componente", datos);
        this.data[tipoPrestacionActual.key] = datos;
    }
}