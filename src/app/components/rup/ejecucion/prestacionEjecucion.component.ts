import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { Plex } from '@andes/plex';
import { DropdownItem } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IProfesional } from './../../../interfaces/IProfesional';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html'
})
export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input() prestacion: IPrestacionPaciente;
    public listaProblemas: IProblemaPaciente[] = [];
    public problemaBuscar: String = '';
    public error: String = '';
    public tiposProblemas = [];
    public tipoProblema = null;
    public problemaTratar: any;
    items = [
        { label: 'Evolucionar Problema', handler: () => { this.evolucionarProblema(this.problemaItem); } },
        { label: 'Transformar Problema', handler: (() => { this.transformarProblema(this.problemaItem); }) },
        { label: 'Enmendar Problema', handler: (() => { this.enmendarProblema(this.problemaItem); }) },
        { label: 'Ver Detalles', handler: (() => { this.verDetalles(this.problemaItem); }) },
    ];
    problemaItem: any;

    showEvolucionar = false;
    showTransformar = false;
    showEnmendar = false;
    showDetalles = false;
    showEvolTodo = false;
    showValidar = false;
    data: Object = {};

    // PRESTACIONES EN EJECUCION
    // tipos de prestaciones posibles a ejecutar durante la prestacion
    // este tipo de prestaciones se le van quitando opciones a medida que ejecuto una nueva
    tiposPrestacionesPosibles: ITipoPrestacion[] = [];
    // prestaciones que se ejecutan por defecto con la prestacion de origen
    // tambien almacenamos las que vamos agregando en la ejecucion de la prestacion de origen
    prestacionesEjecucion: IPrestacionPaciente[] = [];
    // // lista de problemas posibles en la ejecucion/evolucion de las prestaciones
    listaProblemaPrestacion = [];
    // id que se van ejecutando
    idPrestacionesEjecutadas = [];
    // PRESTACIONES FUTURAS
    // utilizado para el select de tipos de prestaciones a ejecutar en un plan
    nuevoTipoPrestacion: ITipoPrestacion;
    // prestacion a pedir a futuro
    nuevaPrestacion: any;
    // array de opcioens seleccionadas
    listaProblemasPlan: any = [];
    // // listado de prestaciones futuras a pedir en el plan
    // prestacionesFuturas: IPrestacionPaciente[] = [];
    valoresPrestaciones: {}[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex, public auth: Auth) {
    }

    mostrarOpciones(problema) {
        this.problemaItem = problema;
    }

    ngOnInit() {
        this.cargarDatosPrestacion();
        // obtenemos tipos de prestaciones posibles a ejecutarse
        this.serviceTipoPrestacion.get({}).subscribe(tiposPrestaciones => {
            this.tiposPrestacionesPosibles = tiposPrestaciones;
        });
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    // lista de problemas
    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre === tipoProblema.nombre);
    }

    guardarProblema(nuevoProblema) {
        console.log('nuevoProblema', nuevoProblema);
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            if (resultado) {
                // asignamos el problema a la prestacion de origen
                this.listaProblemas.push(resultado);
                // this.prestacion.ejecucion.listaProblemas.push(resultado);
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
                paciente: this.prestacion.paciente.id,
                fechaInicio: new Date(),
                evoluciones: [
                    {
                        fecha: new Date(),
                        observacion: 'Inicio del Problema',
                        profesional: this.auth.profesional.id,
                        organizacion: this.auth.organizacion.id,
                        duracion: 'agudo',
                        vigencia: 'activo',
                        segundaOpinion: null
                    }
                ]
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
        this.problemaTratar = problema;

    }

    transformarProblema(problema) {
        this.showTransformar = true;
        this.problemaTratar = problema;
        this.listaProblemas = this.listaProblemas.filter(item => item.id !== problema.id);

    }

    enmendarProblema(problema) {
        this.showEnmendar = true;
        this.problemaTratar = problema;
    }

    verDetalles(problema) {
        this.showDetalles = true;
        this.problemaTratar = problema;
    }

    evolucionarTodo() {
        this.showEvolucionar = false;
        this.showEvolTodo = true;
    }
    // Fin lista de problemas

    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
        this.showEnmendar = false;
        this.showDetalles = false;
    }

    onReturnTransformar(datos: IProblemaPaciente[]) {
        this.showTransformar = false;
        if (datos) {
            // asignamos el problema a la prestacion de origen
            this.listaProblemas = datos;
            this.prestacion.ejecucion.listaProblemas = datos;
            this.updatePrestacion();
        }
    }

    onReturnEnmendar(datos: IProblemaPaciente) {
        this.showEnmendar = false;
        if (datos) {
            this.listaProblemas = this.listaProblemas.filter(p => {
                return p.id !== datos.id;
            });
            this.prestacion.ejecucion.listaProblemas = this.listaProblemas;
            this.updatePrestacion();
        }
    }

    onReturnTodos(dato: IProblemaPaciente[]) {
        this.showEvolucionar = false;
        this.showEvolTodo = false;
    }

    cargarDatosPrestacion() {
        this.listaProblemas = this.prestacion.ejecucion.listaProblemas;
        console.log(this.listaProblemas);
        // loopeamos las prestaciones que se deben cargar por defecto
        // y las inicializamos como una prestacion nueva a ejecutarse
        if (this.prestacion.solicitud) {
                this.prestacion.solicitud.tipoPrestacion.ejecucion.forEach(element => {
                // Verificamos si el tipo de prestacion no está dentro de las prestaciones
                // que se han ejecutado, y de ser así las creo vacias
                let find;
                if (this.prestacion.ejecucion && this.prestacion.ejecucion.prestaciones.length) {
                        find = this.prestacion.ejecucion.prestaciones.find(p => {
                        return p.solicitud.tipoPrestacion.id === element.id;
                    });
                }
                // si no esta en las ejecutadas entonces asignamos para ejecutar las que son por defecto
                if (!find) {
                    // asignamos valores a la nueva prestacion
                    find = this.crearPrestacionVacia(element);
                    this.prestacionesEjecucion.push(find);
                     this.valoresPrestaciones[element.key.toString()] = {};
                } else {
                    this.prestacionesEjecucion.push(find);
                    let key; key = element.key;
                    this.listaProblemaPrestacion[key] = find.solicitud.listaProblemas;

                    // let evolucion; evolucion = (find.ejecucion.evoluciones.length) ? find.ejecucion.evoluciones[find.ejecucion.evoluciones.length - 1].valores[key] : null;
                    // console.log(evolucion);
                    // if (evolucion) {
                    //     this.valoresPrestaciones[key] = {};
                    //     this.valoresPrestaciones[key] = evolucion;
                    // }else {
                    //     this.valoresPrestaciones[key] = null;
                    // }
                }
            });
        }

        // recorremos todas las que se han ejecutado y si no esta
        // dentro de las que cargamos anteriormente las agregamos
        this.prestacion.ejecucion.prestaciones.forEach(_prestacion => {
                let find = this.prestacionesEjecucion.find(pe => {
                return _prestacion.solicitud.tipoPrestacion.id === pe.solicitud.tipoPrestacion.id;
            });

            if (!find) {
                // this.idTiposPrestacionesEjecucion.push(_prestacion.solicitud.tipoPrestacion.id);
                this.prestacionesEjecucion.push(_prestacion);
                let key; key = _prestacion.solicitud.tipoPrestacion.key;
                this.listaProblemaPrestacion[key] = _prestacion.ejecucion.listaProblemas;

                // let evolucion; evolucion = (_prestacion.ejecucion.evoluciones.length) ? _prestacion.ejecucion.evoluciones[find.ejecucion.evoluciones.length - 1].valores[key] : null;
            }
        });
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
                fecha: new Date(),
                evoluciones: []
            }
        };
        this.listaProblemaPrestacion[tipoPrestacion.key] = [];
        return nuevaPrestacion;
    }

    agregarPrestacionEjecucion(tipoPrestacion) {

        let nuevaPrestacion;
        nuevaPrestacion = this.crearPrestacionVacia(tipoPrestacion);

        // buscamos la posicion del array de la prestacion que acabamos
        // de agregar para luego quitarla / deshabilitarla del array de opciones
        let posicion = this.tiposPrestacionesPosibles.findIndex(tp => {
            return tipoPrestacion.id === tp.id;
        });

        // quitamos del array de opciones
        this.tiposPrestacionesPosibles.splice(posicion, 1);
        this.prestacionesEjecucion.push(nuevaPrestacion);
    }

   evolucionarPrestacion() {

         debugger;

         if (this.prestacion.ejecucion.listaProblemas.length > 0) {
             this.error = '';
             let i = 1;
             // obtenemos un array de la cantidad de prestaciones que se van a guardar
            console.log('Prestaciones en ejecucion', this.prestacionesEjecucion);
             let prestacionesGuardar = this.prestacionesEjecucion.filter(_p => {
                 debugger;
                 let tp; tp = _p.solicitud.tipoPrestacion;

                // verificamos si existe algun valor a devolver en data
                if (typeof this.data[tp.key] !== 'undefined') {
                    // si es un objeto, entonces verificamos que no este vacia ninguna
                    // de sus propiedades, y retornamos la prestacion
                    if (typeof this.data[tp.key] === 'object') {
                        return (Object.keys(this.data[tp.key]).length) ? _p : null;
                    }else {
                        // retornamos si es numero, texto, algo distinto de 'undefined'
                        return _p;
                    }
                }
                // no se cumple ninguna condicion retornamos null
                return null;
             });

            console.log('Prestaciones a guardar', prestacionesGuardar);
            if (prestacionesGuardar.length === 0) {
                this.error = 'Debe registrar al menos un dato observable.';
            } else {
                     this.error = '';
                     // recorremos todas las prestaciones que hemos ejecutado
                     prestacionesGuardar.forEach(_prestacion => {
                            let prestacion; prestacion = _prestacion;
                            let tp; tp = _prestacion.solicitud.tipoPrestacion;
                            // Cargo el arreglo de prestaciones evoluciones
                            prestacion.ejecucion.evoluciones.push({valores: {[tp.key]: this.data[tp.key]}} );
                            // si he agregado algun problema a la nueva prestacion, asigno su id a la prestacion a guardar
                            if (this.listaProblemaPrestacion[tp.key] && this.listaProblemaPrestacion[tp.key].length > 0) {
                                // recorremos array de problemas y asignamos a la nueva prestacion
                                this.listaProblemaPrestacion[tp.key].forEach(problema => {
                                    prestacion.solicitud.listaProblemas.push(problema.id);
                                });
                            } else {
                                // si no agrego ningun problema, entonces por defecto se le agregan todos
                                    this.listaProblemas.forEach(idProblema => {
                                        prestacion.solicitud.listaProblemas.push(idProblema);
                                    });
                            }
                            let method = (_prestacion.id) ? this.servicioPrestacion.put(_prestacion) : this.servicioPrestacion.post(_prestacion);

                            if (_prestacion.ejecucion.evoluciones.length < 1){
                                alert('No hay evoluciones');
                            }

                            // guardamos la nueva prestacion
                            method.subscribe(prestacionEjecutada => {
                                // asignamos la prestacion nueva al array de prestaciones ejecutadas
                                let find;
                                if (this.prestacion.ejecucion.prestaciones && this.prestacion.ejecucion.prestaciones.length) {
                                    find = this.prestacion.ejecucion.prestaciones.find(p => {
                                        return p.id === prestacionEjecutada.id;
                                    });
                                }

                                if (!find) {
                                    let id; id = prestacionEjecutada.id;
                                    this.prestacion.ejecucion.prestaciones.push(id);
                                }
                                // actualizamos la prestacion que estamos loopeando con los datos recien guardados
                                _prestacion = prestacionEjecutada;
                                // this.prestacionesFuturas.push(prestacionFutura);
                                if (i === prestacionesGuardar.length) {
                                    this.plex.alert('Prestacion confirmada');
                                    this.updatePrestacion();
                                    this.validarPrestacion();
                                }
                                i++;
                            }); // guardamos la nueva prestacion
                 }); // prestacionesGuardar.forEach
            }; // else Datos observables
     } else {
         this.error = 'Debe seleccionar al menos un problema';
     }; // else problemas
}

    // listado de prestaciones a solicitar y ejecutar durante el transcurso de la prestacion
    getPosiblesPrestaciones() {
        //     this.serviceTipoPrestacion.get({ excluir: this.idTiposPrestacionesEjecucion }).subscribe(event.callback);
    }

    // Prestaciones futuras / Plan
    // Busca los tipos de prestaciones que pueda pedir a futuro como plan
    buscarTipoPrestacion(event) {
        let query = {
            query: event.query,
            turneable: true
        };
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
                },
                ejecucion: {
                    evoluciones: []
                }
            };

            // si he agregado algun problema a la nueva prestacion
            // entonces asigno su id a la prestacion a guardar
            if (this.listaProblemasPlan && this.listaProblemasPlan.length > 0) {
                // recorremos array de problemas y asignamos a la nueva prestacion
                // for (let problema of this.listaProblemaPrestacion[tp.key]) {
                this.listaProblemasPlan.forEach(problema => {
                    this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
                });
            } else {
                // si no agrego ningun problema, entonces por defecto se le agregan todos
                this.nuevaPrestacion.solicitud.listaProblemas = this.listaProblemas;
            }

            // guardamos la nueva prestacion
            this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {
                if (prestacionFutura) {
                    // this.prestacionesFuturas.push(prestacionFutura);

                    // asignamos la prestacion nueva al array de prestaciones futuras
                    this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);

                    this.updatePrestacion();
                }
            });

            this.nuevoTipoPrestacion = null;
            this.listaProblemasPlan = [];
        } else {
            this.plex.alert('Debe seleccionar una prestación');
        }
    }

    // borramos la prestacion del plan
    borrarPrestacionFutura(index) {
        alert('Implementar');
    }
    // Fin prestaciones futuras / Plan

    updatePrestacion() {
        // actualizamos la prestacion de origen
        this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {

            // this.prestacion = prestacionActualizada;
            // buscamos la prestacion actualizada con los datos populados
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {

                this.prestacion = prestacion;
                this.listaProblemas = this.prestacion.ejecucion.listaProblemas;
            });
        });
    }

    validarPrestacion() {
        this.showValidar = true;
    }

    onReturnComponent(datos, tipoPrestacionActual) {
         debugger;
         console.log('this.data[tipoPrestacionActual.key]', this.data[tipoPrestacionActual.key]);
         console.log(this.data);

        // console.log('On return component - this.data[tipoPrestacionActual.key] - ', this.data[tipoPrestacionActual.key]);
        if (this.data[tipoPrestacionActual.key] && !Object.keys(datos).length) {
            delete this.data[tipoPrestacionActual.key];
        }else {
            if (!this.data[tipoPrestacionActual.key]) {
                this.data[tipoPrestacionActual.key] = {};
            }
            this.data[tipoPrestacionActual.key] = datos[tipoPrestacionActual.key];
        }
    }



    volver() {
       this.showValidar = false;
       this.evtData.emit(this.prestacion);
    }
}