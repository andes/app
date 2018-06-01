import { estados } from './../../../../utils/enumerados';
import { IPrestacionRegistro } from './../../interfaces/prestacion.registro.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ObjectID } from 'bson';
import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { PacienteService } from './../../../../services/paciente.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { IPaciente } from './../../../../interfaces/IPaciente';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class PrestacionEjecucionComponent implements OnInit {
    idAgenda: any;
    @HostBinding('class.plex-layout') layout = true;

    // prestacion actual en ejecucion
    public prestacion: IPrestacion;
    public paciente: IPaciente;
    public elementoRUP: IElementoRUP;

    public showPlanes = false;
    public relacion = null;
    public conceptoARelacionar = [];

    // Tipo de busqueda
    public tipoBusqueda: any[];

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = false;

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingRegistro: Boolean = false;

    // Opciones del desplegable para vincular y desvincular
    public itemsRegistros = {};
    public showVincular = false;

    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;
    public scopeEliminar: String;

    // Mustro mpi para cambiar de paciente.
    public showCambioPaciente = false;
    public showDatosSolicitud = false;
    public showPrestacion = false;
    public transformarProblema = false;
    public elementoOnDrag: any;
    public posicionOnDrag;
    // Copia del registro actual para volver todo a la normalidad luego de hacer el drop.
    public copiaRegistro: any;
    // errores
    public errores: any[] = [];

    public registroATransformar: IPrestacionRegistro;

    public masFrecuentes: any[] = [];

    // Defaults de Tabs panel derecho
    public panelIndex = 0;

    // Array de registros de la HUDS a agregar en tabs
    public registrosHuds: any[] = [];

    public prestacionValida = true;
    public mostrarMensajes = false;
    // Seteamos el concepto desde el cual se buscan sus frecuentes
    public conceptoFrecuente: any;
    // boolean de si tengo o no resultados en el buscador
    public tengoResultado: any;
    // el concepto que seleccionamos para eliminar lo guradamos aca.
    public conceptoAEliminar: any;

    public conceptosTurneables: any[];

    // Listado de grupos de la busqueda guiada
    public grupos_guida: any[] = [];

    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = true;

    constructor(
        private servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        public servicioTipoPrestacion: TipoPrestacionService,
        private servicioPaciente: PacienteService,
        private servicioAgenda: AgendaService,
        private conceptObserverService: ConceptObserverService) { }

    /**
     * Inicializamos prestacion a traves del id que viene como parametro de la url
     * Cargamos tipos de prestaciones posibles
     * Inicializamos los datos de la prestacion en caso que se hayan registardo
     * Cargamos los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {

        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.idAgenda = localStorage.getItem('idAgenda');
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.showPrestacion = true;
                    this.servicioPrestacion.getById(id).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        // this.prestacion.ejecucion.registros.sort((a: any, b: any) => a.updatedAt - b.updatedAt);
                        // Si la prestación está validad, navega a la página de validación
                        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                            this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                        } else {
                            // Carga la información completa del paciente
                            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                                this.paciente = paciente;
                            });

                            // Trae el elementoRUP que implementa esta Prestación
                            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
                            // Trae los "más frecuentes" (sugeridos) de esta Prestación
                            this.recuperaLosMasFrecuentes(prestacion.solicitud.tipoPrestacion, this.elementoRUP);

                            // Muestra los registros (y los colapsa)
                            this.mostrarDatosEnEjecucion();

                            if (this.elementoRUP.requeridos.length > 0) {
                                for (let elementoRequerido of this.elementoRUP.requeridos) {
                                    this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                                    let registoExiste = this.prestacion.ejecucion.registros.find(registro => registro.concepto.conceptId === elementoRequerido.concepto.conceptId);

                                    if (!registoExiste) {
                                        this.ejecutarConcepto(elementoRequerido.concepto);
                                    } else if (registoExiste.id && registoExiste.valor) {
                                        // Expandir sólo si no tienen algún valor
                                        this.itemsRegistros[registoExiste.id].collapse = true;
                                    }
                                }
                            }
                        }
                        this.elementosRUPService.guiada(this.prestacion.solicitud.tipoPrestacion.conceptId).subscribe((grupos) => {
                            this.grupos_guida = grupos;
                        });

                    }, (err) => {
                        if (err) {
                            this.plex.info('danger', err, 'Error');
                            this.router.navigate(['/rup']);
                        }
                    });
                }
            });

            // Se traen los Conceptos Turneables para poder quitarlos de la lista de procedimientos
            this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
                this.conceptosTurneables = conceptosTurneables;
            });
        });
    }

    /**
     * recorre los registros de una prestación que ya tiene registros en ejecución
     * y los carga el array itemsRegistros para colapsar y para los registros que se puedan relacionar (items).
     * @memberof PrestacionEjecucionComponent
     */
    mostrarDatosEnEjecucion() {
        if (this.prestacion) {
            // recorremos los registros ya almacenados en la prestación
            this.prestacion.ejecucion.registros.forEach(registro => {
                this.itemsRegistros[registro.id] = { collapse: false, items: null };
                // Si el registro actual tiene registros vinculados, los "populamos"
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id === idRegistroRel); });
                }

            });
            this.armarRelaciones(this.prestacion.ejecucion.registros);
        }
    }

    /**
     * Mover un registro a una posición específica
     *
     * @param posicionActual: posición actual del registro
     * @param posicionNueva: posición donde cargar el registro
     */
    moverRegistroEnPosicion(posicionActual: number, posicionNueva: number) {

        // // buscamos el registro
        let registro = this.prestacion.ejecucion.registros[posicionActual];

        // lo quitamos de la posición actual
        this.prestacion.ejecucion.registros.splice(posicionActual, 1);

        // agregamos a la nueva posición
        this.prestacion.ejecucion.registros.splice(posicionNueva, 0, registro);

        // quitamos relacion si existe
        // if (this.prestacion.ejecucion.registros[posicionNueva]) {
        //     if (this.prestacion.ejecucion.registros[posicionNueva].relacionadoCon) {
        //         let prestacion = this.prestacion.ejecucion.registros[posicionNueva].relacionadoCon[0].concepto.fsn;
        //         // Primer letra con mayúsculas
        //         prestacion = prestacion[0].toUpperCase() + prestacion.slice(1);
        //         this.plex.confirm('Se va a romper la vinculación con el registro:<br><b>' + prestacion + '</b>', '¿Romper vinculación?').then(confirm => {
        //             if (confirm) {
        //                 this.prestacion.ejecucion.registros[posicionNueva].relacionadoCon = [];
        //                 return true;
        //             }
        //             return false;
        //         });
        //     }
        // }
    }


    /**
     * Mover un registro hacia una posición específica
     * Para ello busca su posición actual y llama a moverRegistroEnPoscion()
     *
     * @param {number} posicionNueva: posición actual del registro
     * @param {*} registro: objeto a mover en el array de registros
     * @memberof PrestacionEjecucionComponent
     */
    moverRegistro(posicionNueva: number, registro: any) {
        if (registro.dragData) {
            registro = registro.dragData;
        }
        // buscamos posición actual
        let posicionActual = this.prestacion.ejecucion.registros.findIndex(r => (registro.id === r.id));

        // si la posición a la que lo muevo es distinta a la actual
        // o si la posición nueva es distinta a la siguiente de la actual (misma posicion)
        if ((posicionActual !== posicionNueva) && (posicionNueva !== posicionActual + 1)) {
            // movemos
            this.moverRegistroEnPosicion(posicionActual, posicionNueva);
        }
    }

    vincularRegistros(registroOrigen: any, registroDestino: any) {
        let registros = this.prestacion.ejecucion.registros;

        // si proviene del drag and drop lo que llega es un concepto
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }
        // Verificamos si ya esta vinculado no dejar que se vinculen de nuevo
        let control = this.controlVinculacion(registroOrigen, registroDestino);
        if (control) {
            this.plex.toast('warning', 'Los elementos seleccionados ya se encuentran vinculados.');
            return false;
        }
        // Controlar si lo que llega como parámetro es un registro o es un concepto
        if (!registroOrigen.concepto) {
            this.ejecutarConcepto(registroOrigen, registroDestino);
        } else {
            if (registroOrigen) {
                registroOrigen.relacionadoCon = [registroDestino];
                // // buscamos en la posición que se encuentra el registro de orgien y destino
                // let indexOrigen = registros.findIndex(r => (r.id === registroOrigen.id));
                // let indexDestino = registros.findIndex(r => (r.id && registroDestino.id));

                // registros.splice(indexOrigen, 1);
                // registros.splice(indexDestino + 1, 0, registroOrigen);
            }
        }

    }

    /**
     * Mostrar opciones de confirmación de desvinculación
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    desvincular(registroActual, registroDesvincular) {
        this.confirmarDesvincular[registroActual.id] = registroDesvincular.id;
    }

    /**
     * Quitamos vinculación de los registros
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    confirmarDesvinculacion(registroId, index) {

        // quitamos relacion si existe
        if (this.confirmarDesvincular[registroId]) {
            let registroActual = this.prestacion.ejecucion.registros.find(r => r.id === registroId);

            if (registroActual) {
                registroActual.relacionadoCon = registroActual.relacionadoCon.filter(rr => rr.id !== this.confirmarDesvincular[registroId]);
                delete this.confirmarDesvincular[registroId];
                // this.moverRegistroEnPosicion(index, this.prestacion.ejecucion.registros.length);
            }
        }

    }

    cancelarDesvincular(registroId) {
        delete this.confirmarDesvincular[registroId];
    }

    /**
     * Quitamos elemento del array de registros
     * En caso de tener elementos relacionados, se les quita la relacion
     * hacia el elemento a eliminar
     * @memberof PrestacionEjecucionComponent
     */
    eliminarRegistro() {
        if (this.confirmarEliminar) {
            let registros = this.prestacion.ejecucion.registros;
            let _registro = registros[this.indexEliminar];

            // Quitamos toda la vinculación que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {

                    // relacionadoCon está populado, y debe comprobarse el id
                    if (registro.relacionadoCon[0].id === _registro.id) {
                        registro.relacionadoCon = [];
                    }
                }
            });

            // Si exite el campo idRegistroTransformado significa que el registro a elimininar nace de una transformación
            // y por lo tanto hay qye volver el registro orige a su estado original
            if (_registro.valor && _registro.valor.idRegistroTransformado) {
                let registroOriginal = registros.find(r => r.id === _registro.valor.idRegistroTransformado);
                if (registroOriginal) {
                    registroOriginal.valor.estado = 'activo';
                    delete registroOriginal.valor.idRegistroGenerado;
                }
            }
            // eliminamos el registro del array
            registros.splice(this.indexEliminar, 1);

            this.errores[this.indexEliminar] = null;
            this.indexEliminar = null;
            this.confirmarEliminar = false;
            this.scopeEliminar = '';
        }
    }

    /**
     * Mostramos dialogo de confirmacion en la interfaz
     * para confirmar el borrado del registro
     * @param {any} snomedConcept
     * @param {any} scope
     * @memberof PrestacionEjecucionComponent
     */
    confirmarEliminarRegistro(registroEliminar, scope) {
        let index;
        if (registroEliminar.dragData) {
            this.conceptoAEliminar = registroEliminar.dragData.concepto;
            index = this.prestacion.ejecucion.registros.findIndex(r => (registroEliminar.dragData.id === r.id));
        } else {
            index = this.prestacion.ejecucion.registros.findIndex(r => (registroEliminar.id === r.id));
        }
        this.scopeEliminar = scope;
        this.indexEliminar = index;
        this.confirmarEliminar = true;
    }

    cargarNuevoRegistro(snomedConcept, valor = null) {
        // Si proviene del drag and drop
        if (snomedConcept.dragData) {
            snomedConcept = snomedConcept.dragData;
        }
        // Elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let esSolicitud = false;

        // Si es un plan seteamos el true para que nos traiga el elemento rup por default
        if (this.tipoBusqueda && this.tipoBusqueda.length && this.tipoBusqueda[0] === 'planes') {
            esSolicitud = true;
        }
        let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
        nuevoRegistro['_id'] = nuevoRegistro.id;
        // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;

        // Agregamos al array de registros
        this.prestacion.ejecucion.registros.splice(this.prestacion.ejecucion.registros.length, 0, nuevoRegistro);
        this.showDatosSolicitud = false;
        // this.recuperaLosMasFrecuentes(snomedConcept, elementoRUP);
        return nuevoRegistro;
    }


    /**
     * Al hacer clic en un resultado de SNOMED search se ejecuta esta funcion
     * y se agrega a un array de elementos en ejecucion el elemento rup perteneciente
     * a dicho concepto de snomed
     * @param {any} snomedConcept
     * @param {any} registroVincular Registro al cual vamos a vincular el nuevo
     * @memberof PrestacionEjecucionComponent
     */
    ejecutarConcepto(snomedConcept, registroDestino = null) {
        let valor;
        let resultado;
        this.isDraggingConcepto = false;
        let registros = this.prestacion.ejecucion.registros;
        // si tenemos mas de un registro en en el array de memoria mostramos el button de vincular.
        if (registros.length > 0) {
            this.showVincular = true;
        }

        // El concepto ya aparece en los registros?
        let registoExiste = registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        // si estamos cargando un concepto para una transformación de hall
        if (this.transformarProblema && this.registroATransformar) {

            if (snomedConcept.semanticTag !== 'hallazgo' && snomedConcept.semanticTag !== 'trastorno') {
                this.plex.toast('danger', 'El elemento seleccionado debe ser un hallazgo');
                return false;
            }
            if (registoExiste) {
                this.plex.confirm('El concepto seleccionado ya se ha registrado en la consulta ¿Desea continuar con la transformación?', 'Transformar Problema').then(validar => {
                    if (validar) {
                        // Si el concepto ya esta registrado en la consulta los vinculamos
                        registoExiste.valor['idRegistroTransformado'] = this.registroATransformar.id;
                        registoExiste.valor['origen'] = 'transformación';
                        registoExiste.relacionadoCon = [this.registroATransformar];
                        this.transformarProblema = false;
                        this.registroATransformar.valor.estado = 'transformado';
                        this.registroATransformar.valor['idRegistroGenerado'] = registoExiste.id;
                        return registoExiste;
                    }
                });
            } else {
                // this.registroATransformar.valor.estado = 'transformado';
                valor = { idRegistroTransformado: this.registroATransformar.id, origen: 'transformación' };
                window.setTimeout(() => {
                    let nuevoRegistro = this.cargarNuevoRegistro(snomedConcept, valor);
                    nuevoRegistro.relacionadoCon = [this.registroATransformar];
                    this.transformarProblema = false;
                    this.registroATransformar.valor.estado = 'transformado';
                    this.registroATransformar.valor['idRegistroGenerado'] = nuevoRegistro.id;
                    return nuevoRegistro;
                });

            }
        } else {
            if (registoExiste) {
                this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
                return false;
            }

            // Buscar si es hallazgo o trastorno buscar primero si ya esxiste en Huds
            if (snomedConcept.semanticTag === 'hallazgo' || snomedConcept.semanticTag === 'trastorno' || snomedConcept.semanticTag === 'situación') {
                this.servicioPrestacion.getUnHallazgoPaciente(this.paciente.id, snomedConcept)
                    .subscribe(dato => {
                        if (dato) {
                            // buscamos si es cronico
                            let cronico = dato.concepto.refsetIds.find(item => item === this.servicioPrestacion.refsetsIds.cronico);
                            if (cronico) {
                                valor = {
                                    idRegistroOrigen: dato.evoluciones[0].idRegistro
                                };
                                resultado = this.cargarNuevoRegistro(snomedConcept, valor);
                                if (registroDestino) {
                                    registroDestino.relacionadoCon = [resultado];
                                }
                            } else {
                                // verificamos si no es cronico pero esta activo
                                if (dato.evoluciones[0].estado === 'activo') {
                                    this.plex.confirm('¿Desea evolucionar el mismo?', 'El problema ya se encuentra registrado').then((confirmar) => {
                                        if (confirmar) {
                                            valor = {
                                                idRegistroOrigen: dato.evoluciones[0].idRegistro
                                            };
                                            resultado = this.cargarNuevoRegistro(snomedConcept, valor);
                                            if (registroDestino) {
                                                registroDestino.relacionadoCon = [resultado];
                                            }
                                        } else {
                                            resultado = this.cargarNuevoRegistro(snomedConcept);
                                            if (registroDestino) {
                                                registroDestino.relacionadoCon = [resultado];
                                            }
                                        }
                                    });
                                }
                            }
                        } else {
                            resultado = this.cargarNuevoRegistro(snomedConcept);
                            if (registroDestino) {
                                registroDestino.relacionadoCon = [resultado];
                            }
                        }
                    });


            } else {
                resultado = this.cargarNuevoRegistro(snomedConcept);
                if (registroDestino) {
                    registroDestino.relacionadoCon = [resultado];
                }
            }

        }
    }

    /**
     * Recibe un conpecto de la HUDS para ejecutarlo
     * @param resultadoHuds conpecto de la HUDS puede ser un hallazgo o una prestación
     */
    ejecutarConceptoHuds(resultadoHuds) {
        if (resultadoHuds.tipo === 'prestacion') {
            this.ejecutarConcepto(resultadoHuds.data.solicitud.tipoPrestacion);
        } else {
            let idRegistroOrigen = resultadoHuds.data.evoluciones[0].idRegistro;

            let existeEjecucion = this.prestacion.ejecucion.registros.find((registro) => {
                return (registro.valor) && (registro.valor.idRegistroOrigen) && (registro.valor.idRegistroOrigen === idRegistroOrigen);
            });


            if (!existeEjecucion) {
                let valor = { idRegistroOrigen: idRegistroOrigen };
                window.setTimeout(() => {
                    let resultado = this.cargarNuevoRegistro(resultadoHuds.data.concepto, valor);
                });
            } else {
                this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
                return false;
            }
        }
    }

    cancelarTransformacion() {
        this.transformarProblema = false;
    }

    iniciaTransformarProblema(registro) {
        this.registroATransformar = registro;
        this.transformarProblema = true;
    }

    confirmaTransformar(nuevoHallazgo) {
        // si proviene del drag and drop
        this.isDraggingConcepto = false;
        if (nuevoHallazgo.dragData) {
            nuevoHallazgo = nuevoHallazgo.dragData;
        }
        this.ejecutarConcepto(nuevoHallazgo, this.registroATransformar);

    }


    /* ordenamiento de los elementos */
    /**
     * Indicando si estoy arrastrando registro
     *
     * @param {boolean} dragging true/false
     *
     * @memberof PrestacionEjecucionComponent
     */
    draggingRegistro(i, e, dragging: Boolean) {
        this.elementoOnDrag = e.concepto.conceptId;
        this.posicionOnDrag = i + 1;
        setTimeout(() => {
            this.isDraggingRegistro = dragging;
        });
    }
    /* fin ordenamiento de los elementos */


    /**
     * Validamos si los registros de la consulta tienen valores almacenados
     *
     * @memberof PrestacionEjecucionComponent
     */
    private controlValido(registro) {
        if (registro.registros.length <= 0) {
            registro.valido = (registro.valor !== null) ? true : false;
            if (!registro.valido) {
                this.plex.toast('danger', 'Hay registros incompletos', 'Error', 3000);
                this.colapsarPrestaciones('expand');
            }
        } else {

            let total = registro.registros.length;
            let contadorValiddos = 0;
            registro.registros.forEach(r => {
                let res = this.controlValido(r);
                if (res) {
                    contadorValiddos++;
                }
            });
            registro.valido = (contadorValiddos === total) ? true : false;
        }
        return registro.valido;
    }

    /**
     * Validamos si se puede guardar o no la prestacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    beforeSave() {
        let resultado = true;
        // debugger;
        if (!this.prestacion.ejecucion.registros.length) {
            this.plex.alert('Debe agregar al menos un registro en la consulta', 'Error');
            resultado = false;
        } else {
            this.prestacion.ejecucion.registros.forEach(r => {
                if (!this.controlValido(r)) {
                    this.prestacionValida = false;
                    this.mostrarMensajes = true;
                    resultado = false;
                }
            });

        }

        return resultado;
    }

    controlParams() {
        let respuesta = true;
        let valoresConCero = [];
        debugger;
        if (this.elementoRUP.params.reglasGuardado.requiereValores.length > 0) {
            for (let reg of this.prestacion.ejecucion.registros) {
                let indexRegistro = this.elementoRUP.params.reglasGuardado.requiereValores.findIndex(conceptId => conceptId === reg.concepto.conceptId); // Obtenemos el index del registro
                if (indexRegistro !== -1 && reg.valor === 0) { // Si el registro pertenece a requiereValores y su valor es 0
                    valoresConCero.push(reg);
                }
            }
        }
        if (valoresConCero.length > 0) {
            this.plex.confirm(this.elementoRUP.params.reglasGuardado.mensajes[0], '¿Está seguro que desea seguir?').then((respuestaAlerta) => {
                if (respuestaAlerta) {
                    respuesta = true;
                } else {
                    respuesta = false;
                }
                return respuesta;
            });
        }

    }

    confirmarGuardar() {
        // validamos antes de guardar
        if (!this.beforeSave()) {
            return;
        }
        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
        registros.forEach(registro => {
            if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                registro.relacionadoCon = registro.relacionadoCon.map(r => r.id);
            }
        });

        let params: any = {
            op: 'registros',
            solicitud: this.prestacion.solicitud,
            registros: registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
            this.plex.toast('success', 'Prestación guardada correctamente', 'Prestacion guardada', 100);

            // Si existe un turno y una agenda asociada, y existe un concepto que indica que el paciente no concurrió a la consulta...
            if (this.idAgenda) {
                localStorage.removeItem('idAgenda');
                // Se hace un patch en el turno para indicar que el paciente no asistió (turno.asistencia = "noAsistio")
                let cambios;
                if (this.servicioPrestacion.prestacionPacienteAusente(this.prestacion)) {
                    cambios = {
                        op: 'noAsistio',
                        turnos: [this.prestacion.solicitud.turno]
                    };
                } else {
                    cambios = {
                        op: 'darAsistencia',
                        turnos: [this.prestacion.solicitud.turno]
                    };
                }
                this.servicioAgenda.patch(this.idAgenda, cambios).subscribe();
            }

            // Actualizamos las prestaciones de la HUDS
            this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                this.router.navigate(['rup/validacion', this.prestacion.id]);
            });

        });
    }
    /**
     * Guardamos la prestacion y vamos hacia la pantalla de validacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    guardarPrestacion() {

        let respuesta = true;
        let valoresConCero = [];
        if (this.elementoRUP.params.reglasGuardado.requiereValores.length > 0) {
            for (let reg of this.prestacion.ejecucion.registros) {
                let indexRegistro = this.elementoRUP.params.reglasGuardado.requiereValores.findIndex(conceptId => conceptId === reg.concepto.conceptId); // Obtenemos el index del registro
                if (indexRegistro !== -1 && reg.valor === 0) { // Si el registro pertenece a requiereValores y su valor es 0
                    valoresConCero.push(reg);
                }
            }
        }
        debugger;
        if (valoresConCero.length > 0) {
            this.plex.confirm(this.elementoRUP.params.reglasGuardado.mensajes[0], '¿Está seguro que desea seguir?').then((respuestaAlerta) => {

                if (!respuestaAlerta) {
                    return false;
                }

                this.confirmarGuardar();



            });
        } else {
            this.confirmarGuardar();
        }



    }

    volver(ambito = 'ambulatorio') {
        let mensaje = ambito === 'ambulatorio' ? 'Punto de Inicio' : 'Mapa de Camas';
        this.plex.confirm('<i class="mdi mdi-alert"></i> Se van a perder los cambios no guardados', '¿Volver al ' + mensaje + '?').then(confirmado => {
            if (confirmado) {
                if (ambito === 'ambulatorio') {
                    this.router.navigate(['rup']);
                } else {
                    this.router.navigate(['mapa-de-camas']);
                }
            } else {
                return;
            }
        });
    }

    onConceptoDrop(e: any) {
        if (e.dragData.huds) {
            window.setTimeout(() => {
                this.ejecutarConceptoHuds(e.dragData);
            });
        } else {
            if (e.dragData.tipo) {
                switch (e.dragData.tipo) {
                    case 'prestacion':
                        this.ejecutarConcepto(e.dragData.data.solicitud.tipoPrestacion);
                        break;
                    case 'hallazgo':
                    case 'trastorno':
                    case 'situación':
                        this.ejecutarConcepto(e.dragData.data.concepto);
                        break;
                    default:
                        this.ejecutarConcepto(e.dragData);
                        break;
                }

            } else {
                window.setTimeout(() => {
                    this.ejecutarConcepto(e.dragData);
                });
            }

        }
    }

    arrastrandoConcepto(dragging: boolean) {
        this.isDraggingConcepto = dragging;
        this.showDatosSolicitud = false;
        if (dragging === true) {
            this.colapsarPrestaciones('collapse');
        } else {
            this.itemsRegistros = JSON.parse(JSON.stringify(this.copiaRegistro));
        }
    }

    recibeTipoBusqueda(tipoDeBusqueda) {
        this.tipoBusqueda = tipoDeBusqueda;
    }

    cargaItems(registroActual, indice) {

        // Paso el concepto desde el que se clikeo y filtro para no mostrar su autovinculacion.
        let registros = this.prestacion.ejecucion.registros;
        this.itemsRegistros[registroActual.id].items = [];
        let objItem = {};
        this.itemsRegistros[registroActual.id].items = registros.filter(registro => {
            let control = this.controlVinculacion(registroActual, registro);
            if (registro.id !== registroActual.id) {
                if (registroActual.relacionadoCon && registroActual.relacionadoCon.length > 0) {
                    if (registro.id !== registroActual.relacionadoCon[0].id) {
                        return registro;
                    }
                } else {
                    return registro;
                }

            }
        }).map(registro => {
            return {
                label: (registro.concepto.term.length > 50 ? registro.concepto.term.slice(0, 50) + '...' : registro.concepto.term),
                handler: () => {
                    this.vincularRegistros(registroActual, registro);
                }
            };
        });
    }

    cambioDePaciente($event) {
        this.showCambioPaciente = $event;
    }

    cancelarCambioPaciente() {
        this.showCambioPaciente = false;
    }
    cambiarElPaciente($event) {
        this.plex.confirm('¿Esta seguro que desea cambiar al paciente actual con el paciente ' + $event.nombre + ' ' + $event.apellido + '?').then(resultado => {
            if (resultado) {
                let params: any = {
                    op: 'paciente',
                    paciente: {
                        id: $event.id,
                        nombre: $event.nombre,
                        apellido: $event.apellido,
                        documento: $event.documento,
                        telefono: $event.telefono,
                        sexo: $event.sexo,
                        fechaNacimiento: $event.fechaNacimiento
                    }
                };

                this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
                    this.plex.toast('success', 'El paciente se actualizo correctamente', 'Paciente actualizado');
                    this.servicioPrestacion.getById(this.prestacion.id).subscribe(prestacion => {
                        this.prestacion = prestacion;
                        // Completamos los datos del nuevo paciente seleccionado
                        this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                            this.paciente = paciente;
                        });
                        this.showCambioPaciente = false;
                    });
                });
            }
        });
    }

    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }

    cambiaValorCollapse(indice) {
        if (this.itemsRegistros[indice]) {
            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
        this.registrosColapsados();
    }

    colapsarPrestaciones(option = 'expand') {
        if (this.prestacion.ejecucion.registros) {
            this.copiaRegistro = JSON.parse(JSON.stringify(this.itemsRegistros));
            this.prestacion.ejecucion.registros.forEach(element => {
                if (this.itemsRegistros[element.id]) {
                    if (option === 'expand') {
                        this.itemsRegistros[element.id].collapse = false;
                    } else if (option === 'collapse') {
                        this.itemsRegistros[element.id].collapse = true;
                    }
                }
            });
        }

    }

    recuperaLosMasFrecuentes(concepto = null, elementoRUP = null) {
        if (concepto) {
            this.conceptoFrecuente = concepto;
        } else {
            this.conceptoFrecuente = this.prestacion.solicitud.tipoPrestacion;
        }
        this.masFrecuentes = [];
        if (!elementoRUP && concepto) {
            elementoRUP = this.elementosRUPService.buscarElemento(concepto, false);
        }
        if (elementoRUP && elementoRUP.frecuentes) {
            elementoRUP.frecuentes.forEach(element => {
                this.masFrecuentes.push(element);
            });
        } else {
            // si no hay por un registro en particular mostramos el de la consulta
            if (this.elementoRUP && this.elementoRUP.frecuentes) {
                this.elementoRUP.frecuentes.forEach(element => {
                    this.masFrecuentes.push(element);
                });
            }
        }
        this.tengoResultado = false;
    }

    agregarListadoHuds(registrosHuds) {
        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();
        // this.registrosHuds = registrosHuds;
    }

    // Actualiza ambas columnas de registros según las relaciones
    armarRelaciones(registros) {

        registros = this.prestacion.ejecucion.registros;

        let relacionesOrdenadas = [];

        registros.forEach((cosa, index) => {
            let esPadre = registros.filter(x => x.relacionadoCon[0] === cosa.id);

            if (esPadre.length > 0) {
                if (relacionesOrdenadas.filter(x => x === cosa).length === 0) {
                    relacionesOrdenadas.push(cosa);
                }
                esPadre.forEach(hijo => {
                    if (relacionesOrdenadas.filter(x => x === hijo).length === 0) {
                        relacionesOrdenadas.push(hijo);
                    }
                });
            } else {
                if (cosa.relacionadoCon && registros.filter(x => x.id === cosa.relacionadoCon[0] || x.relacionadoCon[0] === cosa.id).length === 0) {
                    relacionesOrdenadas.push(cosa);
                }
            }

        });

        this.prestacion.ejecucion.registros = relacionesOrdenadas;

    }

    relacionadoConPadre(id) {
        return this.prestacion.ejecucion.registros.filter(x => {
            if (x.relacionadoCon.length > 0) {
                return x.relacionadoCon[0].id !== '';
            }

        });
    }
    // Controla antes de vincular que no esten vinculados
    controlVinculacion(registroOrigen, registroDestino) {
        let control;
        if (this.recorreArbol(registroDestino, registroOrigen)) {
            return true;
        }
        if (registroOrigen === registroDestino) {
            return true;
        }
        if (registroOrigen.relacionadoCon && registroOrigen.relacionadoCon.length > 0) {
            control = registroOrigen.relacionadoCon.find(registro => registro.id === registroDestino.id);
        }
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            control = registroDestino.relacionadoCon.find(registro => registro.id === registroOrigen.id);
        }
        if (control) {
            return true;
        } else {
            return false;
        }
    }

    // Busca recursivamente en los relacionadoCon de los registros
    recorreArbol(registroDestino, registroOrigen) {
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            for (let registro of registroDestino.relacionadoCon) {
                if (registro.id === registroOrigen.id) {
                    return true;
                }
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    return this.recorreArbol(registro, registroOrigen);
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }
    // recibe el tab que se clikeo y lo saca del array..
    cerrartab($event) {
        this.registrosHuds.splice($event, 1);
    }

    recibeSitengoResultado($event) {
        this.tengoResultado = $event;
    }

    /**
     *
     * @param concepto
     * recibe un concepto y retorna si existe en los requeridos o no;
     */
    existe(concepto) {
        let existe;
        if (this.elementoRUP.requeridos.length > 0) {
            existe = this.elementoRUP.requeridos.find(x => x.concepto.conceptId === concepto.conceptId);
            if (existe) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }



    /**
     * Devuelve si un concepto es turneable o no.
     * Se fija en la variable conceptosTurneables inicializada en OnInit
     *
     * @param {any} concepto Concepto SNOMED a verificar si esta en el array de conceptosTurneables
     * @returns  boolean TRUE/FALSE si es turneable o no
     * @memberof BuscadorComponent
     */
    public esTurneable(concepto) {
        if (!this.conceptosTurneables) {
            return false;
        }

        return this.conceptosTurneables.find(x => {
            return x.conceptId === concepto.conceptId;
        });
    }

    registrosColapsados() {
        this.prestacion.ejecucion.registros.forEach(registro => {
            let unRegistro = this.itemsRegistros[registro.id].collapse;
            if (unRegistro !== this.collapse) {
                this.collapse = !this.collapse;
            }
        });
    }

    /**
     * busca los grupos de la busqueda guiada a los que pertenece un concepto
     * @param {IConcept} concept
     */
    matchinBusquedaGuiada(concept) {
        let results = [];
        this.grupos_guida.forEach(data => {
            if (data.conceptIds.indexOf(concept.conceptId) >= 0) {
                results.push(data);
            }
        });
        return results;
    }

    // eliminaTodosLosRegistros() {
    //     this.plex.confirm('Se eliminaran todos los registros de la consulta', '¿Eliminar todos los registros?').then(confirm => {
    //         if (confirm) {
    //             this.prestacion.ejecucion.registros = [];
    //             return true;
    //         }
    //         return false;
    //     });
    // }

}
