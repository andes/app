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
import { IPaciente } from './../../../../interfaces/IPaciente';


@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class PrestacionEjecucionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    // prestacion actual en ejecucion
    public prestacion: IPrestacion;
    public paciente: IPaciente;
    public elementoRUP: IElementoRUP;

    public showPlanes = false;
    public relacion = null;
    public conceptoARelacionar = [];

    // Tipo de busqueda
    public tipoBusqueda: any;

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

    constructor(private servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        public servicioTipoPrestacion: TipoPrestacionService,
        private servicioPaciente: PacienteService) { }

    /**
     * Inicializamos prestacion a traves del id que viene como parametro de la url
     * Cargamos tipos de prestaciones posibles
     * Inicializamos los datos de la prestacion en caso que se hayan registardo
     * Cargamos los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.showPrestacion = true;
                    this.servicioPrestacion.getById(id).subscribe(prestacion => {
                        this.prestacion = prestacion;
                        // Si la prestación está validad, navega a la página de validación
                        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                            this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                        } else {
                            // Carga la información completa del paciente
                            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                                this.paciente = paciente;
                            });

                            // Busca el elementoRUP que implementa esta prestación
                            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
                            this.mostrarDatosEnEjecucion();
                        }
                    }, (err) => {
                        if (err) {
                            this.plex.info('danger', err, 'Error');
                            this.router.navigate(['/rup']);
                        }
                    });
                }
            });
        });
    }

    /**
     * recorre los registros de una prestación que ya tiene registros en ejecucion
     * y los carga el array itemsRegistros para colapsar y para los regsitros que se puedan relacionar (items).
     * @memberof PrestacionEjecucionComponent
     */
    mostrarDatosEnEjecucion() {
        if (this.prestacion) {
            // recorremos los registros ya almacenados en la prestacion
            this.prestacion.ejecucion.registros.forEach(registro => {
                this.itemsRegistros[registro.id] = { collapse: false, items: null };
                // Si el registro actual tiene registros vinvulados los "populamos"
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    registro.relacionadoCon = registro.relacionadoCon.map(idRegistroRel => { return this.prestacion.ejecucion.registros.find(r => r.id = idRegistroRel); });
                }

            });
        }
    }

    /**
     * Mover un registro a una posicion especifica
     *
     * @param posicionActual: posicion actual del registro
     * @param posicionNueva: posicion donde cargar el registro
     */
    moverRegistroEnPosicion(posicionActual: number, posicionNueva: number) {
        // // buscamos el registro
        let registro = this.prestacion.ejecucion.registros[posicionActual];

        // lo quitamos de la posicion actual
        this.prestacion.ejecucion.registros.splice(posicionActual, 1);

        // agregamos a la nueva posicion
        this.prestacion.ejecucion.registros.splice(posicionNueva, 0, registro);

        // quitamos relacion si existe
        if (this.prestacion.ejecucion.registros[posicionNueva]) {
            if (this.prestacion.ejecucion.registros[posicionNueva].relacionadoCon) {
                this.prestacion.ejecucion.registros[posicionNueva].relacionadoCon = null;
            }
        }
    }


    /**
     * Mover un registro hacia una posicion especifica
     * Para ello busca su posicion actual y llama a moverRegistroEnPoscion()
     *
     * @param {number} posicionNueva: posicion actual del registro
     * @param {*} registro: objeto a mover en el array de registros
     * @memberof PrestacionEjecucionComponent
     */
    moverRegistro(posicionNueva: number, registro: any) {
        // buscamos posicion actual
        let posicionActual = this.prestacion.ejecucion.registros.findIndex(r => (registro.id === r.id));

        // si la posicion a la que lo muevo es distinta a la actual
        // o si la posicion nueva es distinta a la siguiente de la actual (misma posicion)
        if ((posicionActual !== posicionNueva) && (posicionNueva !== posicionActual + 1)) {
            // movemos
            this.moverRegistroEnPosicion(posicionActual, posicionNueva);
        }
    }

    vincularRegistros(registroOrigen: any, registroDestino: any) {
        // si proviene del drag and drop
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }
        registroOrigen.relacionadoCon = [registroDestino];
        let registros = this.prestacion.ejecucion.registros;
        // si no existe lo agrego
        let existe = registros.find(r => (registroOrigen.id && registroOrigen.id === r.id) || (r.concepto.conceptId === registroOrigen.conceptId));
        if (!existe) {
            this.ejecutarConcepto(registroOrigen, registroDestino);
        }
        // buscamos en la posicion que se encuentra el registro de orgien y destino
        let indexOrigen = registros.findIndex(r => (r.id === registroOrigen.id));
        let indexDestino = registros.findIndex(r => (r.id && registroDestino.id));
        // movemos
        let _registro = registros[indexOrigen];
        registros.splice(indexOrigen, 1);
        registros.splice(indexDestino + 1, 0, _registro);

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
                this.moverRegistroEnPosicion(index, this.prestacion.ejecucion.registros.length);
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

            // quitamos toda la vinculacion que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    if (registro.relacionadoCon[0].id === _registro.id) {
                        registro.relacionadoCon = [];
                    }
                }
            });

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
        this.scopeEliminar = scope;
        let index = this.prestacion.ejecucion.registros.findIndex(r => (registroEliminar.id === r.id));

        this.indexEliminar = index;
        this.confirmarEliminar = true;
    }

    cargarNuevoRegistro(snomedConcept, valor = null) {
        this.recuperaLosMasFrecuentes(snomedConcept);
        // si proviene del drag and drop
        if (snomedConcept.dragData) {
            snomedConcept = snomedConcept.dragData;
        }
        // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let esSolicitud = false;

        // Si es un plan seteamos el true para que nos traiga el elemento rup por default
        // tambien verificamos si es un autocitado por su conceptId.. Ver si se puede hacer de otra manera.
        if (this.tipoBusqueda === 'planes' || snomedConcept.conceptId === '281036007') {
            esSolicitud = true;
        }
        let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
        nuevoRegistro['_id'] = nuevoRegistro.id;
        // verificamos si es un plan. Si es plan seteamos esSolicitud en true.
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;
        // agregamos al array de registros
        this.prestacion.ejecucion.registros.splice(this.prestacion.ejecucion.registros.length, 0, nuevoRegistro);
        this.showDatosSolicitud = false;
        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
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
        this.isDraggingConcepto = false;
        let registros = this.prestacion.ejecucion.registros;
        // si tenemos mas de un registro en en el array de memoria mostramos el button de vincular.
        if (registros.length > 0) {
            this.showVincular = true;
        }
        // nos fijamos si el concepto ya aparece en los registros
        let registoExiste = registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);

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
                this.registroATransformar.valor.estado = 'transformado';
                let valor = { idRegistroTransformado: this.registroATransformar.id, origen: 'transformación' };
                let nuevoRegistro = this.cargarNuevoRegistro(snomedConcept, valor);
                nuevoRegistro.relacionadoCon = [this.registroATransformar];
                this.transformarProblema = false;
                this.registroATransformar.valor.estado = 'transformado';
                this.registroATransformar.valor['idRegistroGenerado'] = nuevoRegistro.id;
                return nuevoRegistro;
            }

        } else {
            if (registoExiste) {
                this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
                return false;
            }
            this.colapsarPrestaciones();
            // Buscar si es hallazgo o trastorno buscar primero si ya esxiste en Huds
            if (snomedConcept.semanticTag === 'hallazgo' || snomedConcept.semanticTag === 'trastorno') {
                this.servicioPrestacion.getUnHallazgoPaciente(this.paciente.id, snomedConcept)
                    .subscribe(dato => {
                        if (dato) {
                            // TODO:: vamos a comprobar si se trata de hallazgo cronico o activo
                            if (dato.evoluciones[0].estado === 'activo') {
                                let valor = { idRegistroOrigen: dato.evoluciones[0].idRegistro };
                                let resultado = this.cargarNuevoRegistro(snomedConcept, valor);
                                if (registroDestino) {
                                    registroDestino.relacionadoCon = [resultado];
                                }
                            } else {
                                let resultado = this.cargarNuevoRegistro(snomedConcept);
                                if (registroDestino) {
                                    registroDestino.relacionadoCon = [resultado];
                                }
                            }
                        } else {
                            let resultado = this.cargarNuevoRegistro(snomedConcept);
                            if (registroDestino) {
                                registroDestino.relacionadoCon = [resultado];
                            }
                        }
                    });

            } else {
                let resultado = this.cargarNuevoRegistro(snomedConcept);
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
            this.ejecutarConcepto(resultadoHuds.data.concepto);
        }
    }

    cancelarTransformacion() {
        this.transformarProblema = false;
    }

    iniciaTransformarProblema(registro) {
        this.registroATransformar = registro;
        this.transformarProblema = true;
    }

    ConfirmaTransformar(nuevoHallazgo) {
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
     * Validamos si se puede guardar o no la prestacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    beforeSave() {
        let resultado = true;
        if (!this.prestacion.ejecucion.registros.length) {
            this.plex.alert('Debe agregar al menos un registro en la consulta', 'Error');
            return false;
        }
        // this.registros.forEach((r,RUPComponentsArray i) => {
        //     // for (let i = 0; i < this.registros.length; i++) {
        //     // let r = this.registros[i];
        //     this.errores[i] = null;
        //     // verificamos si existe algun valor a devolver en data
        //     if (typeof this.data[r.elementoRUP.key] === 'undefined') {
        //         this.errores[i] = 'Debe completar con algún valor';
        //         resultado = false;
        //     } else {
        //         if (!this.data[r.elementoRUP.key][r.concepto.conceptId]) {
        //             this.errores[i] = 'Debe completar con algún valor';
        //             resultado = false;
        //         }
        //     }
        // });

        return resultado;
    }

    /**
     * Guardamos la prestacion y vamos hacia la pantalla de validacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    guardarPrestacion() {
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
            registros: registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada');
            // actualizamos las prestaciones de la HUDS
            this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                this.router.navigate(['rup/validacion', this.prestacion.id]);
            });
        });
    }

    volver() {
        this.plex.confirm('Se van a perder los cambios no guardados', '<i class="mdi mdi-alert"></i> ¿Volver al Punto de Inicio?').then(confirmado => {
            if (confirmado) {
                this.router.navigate(['rup']);
            } else {
                return;
            }
        })
    }

    onConceptoDrop(e: any) {

        if (e.dragData.tipo) {
            switch (e.dragData.tipo) {
                case 'prestacion':
                    this.ejecutarConcepto(e.dragData.data.solicitud.tipoPrestacion);
                    break;
                case 'hallazgo':
                case 'trastorno':
                    this.ejecutarConcepto(e.dragData.data.concepto);
                    break;
                default:
                    this.ejecutarConcepto(e.dragData);
                    break;
            }

        } else {
            this.ejecutarConcepto(e.dragData);
        }
    }

    arrastrandoConcepto(dragging: boolean) {
        this.isDraggingConcepto = dragging;
        this.showDatosSolicitud = false;
        if (dragging === true) {
            this.colapsarPrestaciones();
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
                label: 'vincular con: ' + registro.concepto.term,
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
    cambiaValorCollapse(valor: boolean, indice) {
        this.itemsRegistros[indice].collapse = valor;
    }

    colapsarPrestaciones() {
        if (this.prestacion.ejecucion.registros) {
            this.copiaRegistro = JSON.parse(JSON.stringify(this.itemsRegistros));
            this.prestacion.ejecucion.registros.forEach(element => {
                if (this.itemsRegistros[element.id]) {
                    this.itemsRegistros[element.id].collapse = true;
                }
            });
        }
    }
    recuperaLosMasFrecuentes(concepto) {
        this.masFrecuentes = [];
        let elementoRUP = this.elementosRUPService.buscarElemento(concepto, false);
        elementoRUP.frecuentes.forEach(element => {
            this.masFrecuentes.push(element);
        });
    }
}
