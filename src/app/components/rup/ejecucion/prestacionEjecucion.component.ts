import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
// import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

import { Plex } from 'andes-plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html'
})
export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    @Input() prestacion: IPrestacionPaciente;
    listaProblemas: IProblemaPaciente[] = [];
    problemaBuscar: String = '';

    tiposProblemas = [];
    tipoProblema = null;
    problemaEvolucionar: any;

    showEvolucionar = false;
    showEvolTodo = false;
    showValidar = false;
    data: Object = {};

    prestacionesEjecutar: any[] = [];
    // nuevas prestaciones a ejecutar en la consulta 
    nuevasPrestaciones: ITipoPrestacion[] = [];


    // AGREGAR PRESTACION
    // objeto para crear una nueva prestacion e inicializar
    nuevaPrestacion: any;
    // lista de problemas posibles en la ejecucion/evolucion de las prestaciones
    listaProblemaPrestacion = [];
    // prestacion seleccionada para ejecutar en el transcurso de la prestacion original
    prestacionAEjecutar: any = null;
    // array de id prestaciones que se ejecutaron en la consulta para filtrar luego
    prestacionesEjecucion: any[] = [];
    idTiposPrestacionesEjecucion: any[] = [];

    // PRESTACIONES FUTURAS
    // utilizado para el select
    nuevoTipoPrestacion: ITipoPrestacion;
    // array de opcioens seleccionadas
    nuevaPrestacionListaProblemas: any = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];

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

        // loopeamos las prestaciones que se deben cargar por defecto
        // y las inicializamos como una prestacion nueva a ejecutarse
        this.prestacion.solicitud.tipoPrestacion.ejecucion.forEach(element => {
            // Verificamos si el tipo de prestacion no está dentro de las prestaciones 
            //  que se han ejecutado, y de ser así las creo vacias 
            let find = this.prestacion.prestacionesEjecutadas.find(p => {
                return p.solicitud.tipoPrestacion.id === element.id
            });

            // si no esta en las ejecutadas entonces asignamos para ejecutar las que son por defecto
            if (!find) {
                // asignamos valores a la nueva prestacion
                let nuevaPrestacion = this.crearPrestacionVacia(element);
            }else{
                this.idTiposPrestacionesEjecucion.push(element.id);
                this.prestacionesEjecucion.push(find);
            }

        });

        // recorremos todas las que se han ejecutado y si no esta 
        // dentro de las que cargamos anteriormente las agregamos
        this.prestacion.prestacionesEjecutadas.forEach(_prestacion => {

            let find = this.idTiposPrestacionesEjecucion.find(idP => {
                return _prestacion.solicitud.tipoPrestacion.id === idP
            });

            if (!find) {
                this.idTiposPrestacionesEjecucion.push(_prestacion.solicitud.tipoPrestacion.id);
                this.prestacionesEjecucion.push(_prestacion);
            }
        });


        // por ultimo recorremos todas las que esten en ejecucion actualmente y asignamos 
        // sus problemas que se cargaron en la solicitud
        this.prestacionesEjecucion.forEach(_prestacion => {
            this.listaProblemaPrestacion[_prestacion.solicitud.tipoPrestacion.key] = _prestacion.solicitud.listaProblemas;
        });


        //      2) Si el tipo de prestacion se encuentra dentro de las prsetaciones ejecutadas
        //      en la prestacion actual, entonces la asigno y paso sus valroes
        //      *******************************
        //      *******************************
        //     */

        //     let nuevaPrestacion = {};
        //     nuevaPrestacion = this.crearPrestacion(element);
        //     this.prestacionesEjecucion.push(nuevaPrestacion);

        //     // agregamos los ids de las prestaciones al array de prestaciones en ejecucion 
        //     // para luego poder filtrar y agregar nuevas prestaciones evitando duplicados
        //     // this.idPrestacionesEjecucion.push(this.prestacion.solicitud.tipoPrestacion.id);
        //     this.idPrestacionesEjecucion.push(element.id);
        // });
        // console.log(this.prestacionesEjecucion);

        // recorremos todas las prestaciones que vienen en la ejecucion de la prestacion de origen
        // y la agregamos a la lista de prestaciones a omitir en el select
        // if (this.prestacion.solicitud.tipoPrestacion.ejecucion) {
        //     let length = this.prestacion.solicitud.tipoPrestacion.ejecucion.length;
        //     for (let i = 0; i < length; i++) {
        //         this.prestacionesEjecucion.push(this.prestacion.solicitud.tipoPrestacion.ejecucion[i].id);
        //     }
        // }

        // this.serviceTipoPrestacion.get({excluir: this.prestacionesEjecucion}).subscribe(tiposPrestaciones => {
        //     this.prestacionesEjecutar = tiposPrestaciones;
        // });


        // buscamos las prestaciones soliciutadas y ejecutadas por la misma
        // prestacion y las almacenamos en el array de nuevasPrestaciones
        // this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id }).subscribe(prestaciones => {
        //     console.error(prestaciones);
        //     // this.nuevasPrestaciones = prestaciones;
        //     this.nuevasPrestaciones = prestaciones.map(function (prestacion) {
        //         return prestacion.solicitud.tipoPrestacion;
        //         // return {
        //         //     id: pretacion.id,
        //         //     nombre: pretacion.tipoProblema.nombre
        //         // };
        //     });
        // });
    }

    crearPrestacionVacia(tipoPrestacion) {
        // asignamos valores a la nueva prestacion
        let nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.prestacion.paciente,
            solicitud: {
                tipoPrestacion: tipoPrestacion,
                fecha: new Date(),
                listaProblemas: []
            },
            estado: {
                timestamp: new Date(),
                tipo: 'ejecucion'
            },
            ejecucion: {
                evoluciones: []
            }
        };

        this.prestacionesEjecucion.push(nuevaPrestacion);

        return nuevaPrestacion;
    }

    evolucionarPrestacion(prestacion) {
        let tp = prestacion.solicitud.tipoPrestacion;

        prestacion.ejecucion = {
            fecha: new Date(),
            evoluciones: [{
                valores: this.data[tp.key],
                estado: [{
                    timestamp: new Date(),
                    tipo: 'ejecucion'
                }]
            }]
        };

        // si he agregado algun problema a la nueva prestacion
        // entonces asigno su id a la prestacion a guardar
        if (this.listaProblemaPrestacion[tp.key] && this.listaProblemaPrestacion[tp.key].length) {
            // recorremos array de problemas y asignamos a la nueva prestacion
            for (let problema of this.listaProblemaPrestacion[tp.key]) {
                prestacion.solicitud.listaProblemas.push(problema.id);
            }

        }else {
            // si no agrego ningun problema, entonces por defecto se le agregan todos
            prestacion.solicitud.listaProblemas = this.listaProblemas;
        }

        // guardamos la nueva prestacion 
        this.servicioPrestacion.post(prestacion).subscribe(prestacionEjecutada => {
            // inicializamos el array en caso de que haga falta
            // if (typeof this.prestacion.prestacionesEjecutadas === 'undefined') {
            //     this.prestacion.prestacionesEjecutadas = [];
            // }

            // asignamos la prestacion nueva al array de prestaciones futuras
            let id; id = prestacionEjecutada.id;
            this.prestacion.prestacionesEjecutadas.push(id);

            this.updatePrestacion();

            // this.prestacionesFuturas.push(prestacionFutura);
            this.plex.alert('Prestacion confirmada');
        });

        console.log("en confirmacion", prestacion);
    //     // asignamos valores a la nueva prestacion
    //     this.nuevaPrestacion = {
    //         idPrestacionOrigen: this.prestacion.id,
    //         paciente: this.prestacion.paciente.id,
    //         solicitud: {
    //             tipoPrestacion: tipoPrestacionActual,
    //             fecha: new Date(),
    //             listaProblemas: []
    //         },
    //         estado: {
    //             timestamp: new Date(),
    //             tipo: 'ejecucion'
    //         },
    //         ejecucion: {
    //             fecha: new Date(),
    //             evoluciones: [{
    //                 valores: this.data[tipoPrestacionActual.key],
    //                 estado: [{
    //                     timestamp: new Date(),
    //                     tipo: 'ejecucion'
    //                 }]
    //             }]
    //         }
    //     };

    //     // si he agregado algun problema a la nueva prestacion
    //     // entonces asigno su id a la prestacion a guardar
    //     if (this.listaProblemaPrestacion[tipoPrestacionActual.key] && this.listaProblemaPrestacion[tipoPrestacionActual.key].length) {
    //         // inicializamos el array en caso de que haga falta
    //         // if (typeof this.nuevaPrestacion.solicitud.listaProblemas === 'undefined') {
    //         //     this.nuevaPrestacion.solicitud.listaProblemas = [];
    //         // }
    //         // recorremos array de problemas y asignamos a la nueva prestacion
    //         for (let problema of this.listaProblemaPrestacion[tipoPrestacionActual.key]) {
    //             this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
    //         }

    //     }else {
    //         // si no agrego ningun problema, entonces por defecto se le agregan todos
    //         this.nuevaPrestacion.solicitud.listaProblemas = this.listaProblemas;
    //     }

    //     console.log(this.nuevaPrestacion);

    //     // guardamos la nueva prestacion 
    //     this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {

    //         // asignamos la prestacion nueva al array de prestaciones futuras
    //         this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);

    //         // this.prestacionesFuturas.push(prestacionFutura);
    //         this.plex.alert('Prestacion confirmada');

    //     });
    }

    // listado de prestaciones a solicitar y ejecutar durante el transcurso de la prestacion
    posiblesPrestaciones(event) {
        this.serviceTipoPrestacion.get({ excluir: this.idTiposPrestacionesEjecucion }).subscribe(event.callback);
    }

    // Prestaciones futuras / Plan
    // Busca los tipos de prestaciones que pueda pedir a futuro como plan
    buscarTipoPrestacion(event) {
        let query = {
            query: event.query,
            turneable: true
        }
        this.serviceTipoPrestacion.get(query).subscribe(event.callback);
    }

    // agregamos la prestacion al plan
    agregarPrestacionFutura() {
        if (this.nuevoTipoPrestacion) {

            // asignamos valores a la nueva prestacion
            this.nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.prestacion.paciente,
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
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
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


    // onReturnValores(valor: Number, tipoPrestacion: any) {
    //     let valoresPrestacion = {};
    //     valoresPrestacion[tipoPrestacion.key] = valor;

    //     this.data[tipoPrestacion.key] = valoresPrestacion;

    // }

    onReturnComponent(datos, tipoPrestacionActual) {
        console.log("dato del componente", datos);
        this.data[tipoPrestacionActual.key] = datos;
    }

    // evolucionarPrestacion(tipoPrestacionActual) {
    //     // console.log("en confirmacion", this.data[tipoPrestacionActual.key]);

    //     // asignamos valores a la nueva prestacion
    //     this.nuevaPrestacion = {
    //         idPrestacionOrigen: this.prestacion.id,
    //         paciente: this.prestacion.paciente.id,
    //         solicitud: {
    //             tipoPrestacion: tipoPrestacionActual,
    //             fecha: new Date(),
    //             listaProblemas: []
    //         },
    //         estado: {
    //             timestamp: new Date(),
    //             tipo: 'ejecucion'
    //         },
    //         ejecucion: {
    //             fecha: new Date(),
    //             evoluciones: [{
    //                 valores: this.data[tipoPrestacionActual.key],
    //                 estado: [{
    //                     timestamp: new Date(),
    //                     tipo: 'ejecucion'
    //                 }]
    //             }]
    //         }
    //     };

    //     // si he agregado algun problema a la nueva prestacion
    //     // entonces asigno su id a la prestacion a guardar
    //     if (this.listaProblemaPrestacion[tipoPrestacionActual.key] && this.listaProblemaPrestacion[tipoPrestacionActual.key].length) {
    //         // inicializamos el array en caso de que haga falta
    //         // if (typeof this.nuevaPrestacion.solicitud.listaProblemas === 'undefined') {
    //         //     this.nuevaPrestacion.solicitud.listaProblemas = [];
    //         // }
    //         // recorremos array de problemas y asignamos a la nueva prestacion
    //         for (let problema of this.listaProblemaPrestacion[tipoPrestacionActual.key]) {
    //             this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
    //         }

    //     }else {
    //         // si no agrego ningun problema, entonces por defecto se le agregan todos
    //         this.nuevaPrestacion.solicitud.listaProblemas = this.listaProblemas;
    //     }

    //     console.log(this.nuevaPrestacion);

    //     // guardamos la nueva prestacion 
    //     this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {

    //         // asignamos la prestacion nueva al array de prestaciones futuras
    //         this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);

    //         // this.prestacionesFuturas.push(prestacionFutura);
    //         this.plex.alert('Prestacion confirmada');

    //     });
    // }

    validarPrestacion() {
        this.showValidar = true;
    }

    onReturnComponente(datos, tipoPrestacionActual) {
        console.log("dato del componente", datos);
        this.data[tipoPrestacionActual.key] = datos;
    }
}