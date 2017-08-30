import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IElementoRUP } from './../../interfaces/elemento-rup.interface';
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

    // Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda = 'problemas'; // Por defecto trae los problemas
    public showPlanes = false;
    public relacion = null;
    public conceptoARelacionar = [];

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = false;

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingRegistro: Boolean = false;
    // Opciones del desplegable para vincular y desvincular
    public items = [];
    public showVincular = false;

    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;
    public scopeEliminar: String;

    // Mustro mpi para cambiar de paciente.
    public showCambioPaciente = false;
    public showDatosSolicitud = false;
    public elementoOnDrag: any;
    public posicionOnDrag;
    // Copia del registro actual para volver todo a la normalidad luego de hacer el drop.
    public copiaRegistro: any;
    // errores
    public errores: any[] = [];

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
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;
                // Si la prestación está validad, navega a la página de validación
                if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                    this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                } else {
                    // Carga la información completa del paciente
                    // [jgabriel] ¿Hace falta esto?
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
        });
    }

    prestacionChanged() {
        console.log(this.prestacion);
        alert('Cambió la prestación');
    }

    /**
      * Carga un nuevo registro en el array general de registros y los valores en el array data
      *
      * @param {*} registro: objeto a insertar en el array de registros
      * @memberof PrestacionEjecucionComponent
      */
    // mostrarUnRegistro(registro) {
    //     let elementoRUPRegistro = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, registro.concepto, registro.tipo);
    //     // armamos el elemento data a agregar al array de registros
    //     let data = {
    //         tipo: registro.tipo,
    //         concepto: registro.concepto,
    //         elementoRUP: elementoRUPRegistro,
    //         valor: registro.valor,
    //         destacado: registro.destacado ? registro.destacado : false,
    //         relacionadoCon: registro.relacionadoCon ? registro.relacionadoCon : null
    //     };

    //     this.registros.push(data);

    //     if (!this.data[elementoRUPRegistro.key]) {
    //         this.data[elementoRUPRegistro.key] = {};
    //     }

    //     if (!this.data[elementoRUPRegistro.key][registro.concepto.conceptId]) {
    //         this.data[elementoRUPRegistro.key][registro.concepto.conceptId] = {};
    //     }
    //     this.data[elementoRUPRegistro.key][registro.concepto.conceptId] = registro.valor[elementoRUPRegistro.key];

    //     for (let i in this.registros) {
    //         this.cargaItems(this.registros[i], i);
    //         // Actualizamos cuando se agrega el array..
    //     }
    // }


    /**
     * recorre los registros de una prestación que ya tiene registros en ejecucion
     * y los carga en el array de registros.
     * Si se trata de Hallazgo o Trastorno cronico lo busca primero en la Huds, sino
     * se llama al mostrarUnRegistro() para cargar un registro comun
     *
     * @memberof PrestacionEjecucionComponent
     */
    mostrarDatosEnEjecucion() {
        // this.registros = [];
        // // this.data = [];
        // if (this.prestacion) {
        //     // recorremos los registros ya almacenados en la prestacion y rearmamos el
        //     // arreglo registros y data en memoria
        //     this.prestacion.ejecucion.registros.forEach(registro => {
        //         // Buscar si es hallazgo o trastorno buscar primero si ya esxiste en Huds
        //         if (registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno') {
        //             let hallazgo = this.servicioPrestacion.getUnHallazgoPaciente(this.paciente.id, registro.concepto, this.prestacion.id);
        //             hallazgo.subscribe(dato => {
        //                 if (dato) {
        //                     // vamos a comprobar si se trata de hallazgo cronico
        //                     if (dato.evoluciones && dato.evoluciones.length > 1 && dato.evoluciones[0].esCronico) {
        //                         let datoModificar = {
        //                             datoCompleto: dato,
        //                             ultimaEvolucion: dato.evoluciones[0] ? dato.evoluciones[0] : null
        //                         };
        //                         // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        //                         let elementoRUP = this.servicioElementosRUP.nuevaEvolucion;
        //                         // armamos el elemento data a agregar al array de registros
        //                         let data = {
        //                             collapse: false,
        //                             tipo: 'problemas',
        //                             concepto: registro.concepto,
        //                             elementoRUP: elementoRUP,
        //                             valor: datoModificar,
        //                             destacado: false,
        //                             relacionadoCon: null
        //                         };
        //                         this.registros.splice(this.registros.length, 0, data);
        //                         if (!this.data[elementoRUP.key]) {
        //                             this.data[elementoRUP.key] = {};
        //                         }
        //                         this.data[elementoRUP.key][registro.concepto.conceptId] = datoModificar;
        //                         for (let i in this.registros) {
        //                             this.cargaItems(this.registros[i], i);
        //                             // Actualizamos cuando se agrega el array..
        //                         }
        //                     } else {
        //                         this.mostrarUnRegistro(registro);
        //                     }
        //                 } else {
        //                     this.mostrarUnRegistro(registro);
        //                 }
        //             });
        //         } else {
        //             this.mostrarUnRegistro(registro);
        //         }
        //     });
        // }
    }



    /**
     * Carga un nuevo registro en el array en una posicion determinada
     *
     * @param posicion: posicion donde cargar el nuevo registro
     * @param registro: objeto a cargar en el array de registros
     */
    /*
    cargarRegistroEnPosicion(posicion: number, registro: any) {
        this.registros.splice(posicion, 0, registro);
    }
    */

    /**
     * Mover un registro a una posicion especifica
     *
     * @param posicionActual: posicion actual del registro
     * @param posicionNueva: posicion donde cargar el registro
     */
    moverRegistroEnPosicion(posicionActual: number, posicionNueva: number) {
        // // buscamos el registro
        // let registro = this.registros[posicionActual];

        // // lo quitamos de la posicion actual
        // this.registros.splice(posicionActual, 1);

        // // agregamos a la nueva posicion
        // this.registros.splice(posicionNueva, 0, registro);

        // // quitamos relacion si existe
        // if (this.registros[posicionNueva]) {
        //     if (this.registros[posicionNueva].relacionadoCon) {
        //         this.registros[posicionNueva].relacionadoCon = null;
        //     }
        // }
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
        // let posicionActual = this.registros.findIndex(r => (registro.dragData.concepto.conceptId === r.concepto.conceptId));

        // // si la posicion a la que lo muevo es distinta a la actual
        // // o si la posicion nueva es distinta a la siguiente de la actual (misma posicion)
        // if ((posicionActual !== posicionNueva) && (posicionNueva !== posicionActual + 1)) {
        //     // movemos
        //     this.moverRegistroEnPosicion(posicionActual, posicionNueva);
        // }
    }

    vincularRegistros(registroOrigen: any, registroDestino: any) {
        // si proviene del drag and drop
        // if (registroOrigen.dragData) {
        //     registroOrigen = registroOrigen.dragData;
        // }

        // // si no existe lo agrego
        // let existe = this.registros.find(r => (registroOrigen.concepto && registroOrigen.concepto.conceptId === r.concepto.conceptId) || (r.concepto.conceptId === registroOrigen.conceptId));
        // if (!existe) {
        //     this.ejecutarConcepto(registroOrigen, registroDestino);
        // }

        // let conceptIdOrigen = (registroOrigen.concepto) ? registroOrigen.concepto.conceptId : registroOrigen.conceptId;

        // // buscamos en la posicion que se encuentra el registro de orgien y destino
        // let indexOrigen = this.registros.findIndex(r => (conceptIdOrigen === r.concepto.conceptId));
        // let indexDestino = this.registros.findIndex(r => (registroDestino.concepto && registroDestino.concepto.conceptId === r.concepto.conceptId) || (registroDestino.concepto.conceptId === r.concepto.conceptId));

        // // solo vinculamos si no es el mismo elemento
        // if (conceptIdOrigen === registroDestino.concepto.conceptId) {
        //     return false;
        // }

        // // si ya está vinculado a algun otro registro, no permitimos la vinculacion
        // /*
        // if (registroDestino.relacionadoCon) {
        //     return false;
        // }
        // */

        // // buscamos todos los conceptos que tenga relacionados
        // let relacionados = this.registros.filter(r => {
        //     return (r.relacionadoCon && r.relacionadoCon.conceptId === conceptIdOrigen);
        // });

        // /*
        // // si no tiene relacion con ninguno (es padre) y no tiene elementos relacionados
        // // entonces no permitimos mover el elemento
        // if (relacionados.length && !registroOrigen.relacionadoCon) {
        //     return false;
        // }
        // */

        // // vinculamos
        // this.registros[indexOrigen].relacionadoCon = registroDestino.concepto;

        // // movemos
        // let _registro = this.registros[indexOrigen];
        // this.registros.splice(indexOrigen, 1);
        // this.registros.splice(indexDestino + 1, 0, _registro);



        // for (let i in this.registros) {
        //     this.cargaItems(this.registros[i], i);
        //     // Actualizamos cuando se agrega el array..
        // }
        // // this.moverRegistroEnPosicion()
        // /*
        // if (relacionados.length) {
        //     relacionados.forEach(r => {
        //         r.relacionadoCon = null;
        //     });
        // }
        // */

    }

    /**
     * Mostrar opciones de confirmación de desvinculación
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    desvincular(index) {
        this.confirmarDesvincular[index] = true;
    }

    /**
     * Quitamos vinculación de los registros
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    confirmarDesvinculacion(index) {

        // // quitamos relacion si existe
        // if (this.registros[index].relacionadoCon) {
        //     this.registros[index].relacionadoCon = null;

        //     this.confirmarDesvincular[index] = false;

        //     this.moverRegistroEnPosicion(index, this.registros.length);
        //     for (let i in this.registros) {
        //         this.cargaItems(this.registros[i], i);
        //         // Actualizamos cuando se agrega el array..
        //     }
        // }

        // // si no tiene ningun elemento relacionado entonces es un elemento padre
        // if (!this.registros[index].relacionadoCon) {
        //     // this.registros.splice(index, 1);
        // }
    }

    /**
     * Quitamos elemento del array de registros
     * En caso de tener elementos relacionados, se les quita la relacion
     * hacia el elemento a eliminar
     * @memberof PrestacionEjecucionComponent
     */
    eliminarRegistro() {
        // if (this.confirmarEliminar) {
        //     let _registro = this.registros[this.indexEliminar];

        //     // quitamos toda la vinculacion que puedan tener con el registro
        //     let registrosVinculados = this.registros.filter(r => {
        //         return (r.relacionadoCon && r.relacionadoCon.conceptId === _registro.concepto.conceptId);
        //     });

        //     registrosVinculados.forEach(registro => {
        //         registro.relacionadoCon = null;
        //     });

        //     // eliminamos el registro del array
        //     this.registros.splice(this.indexEliminar, 1);

        //     // limpiamos el valor de data
        //     delete this.data[_registro.elementoRUP.key];

        //     this.errores[this.indexEliminar] = null;
        //     this.indexEliminar = null;
        //     this.confirmarEliminar = false;
        //     this.scopeEliminar = '';
        // }
    }

    /**
     * Mostramos dialogo de confirmacion en la interfaz
     * para confirmar el borrado del registro
     * @param {any} snomedConcept
     * @param {any} scope
     * @memberof PrestacionEjecucionComponent
     */
    confirmarEliminarRegistro(snomedConcept, scope) {
        // this.scopeEliminar = scope;
        // let concept = (snomedConcept.dragData) ? snomedConcept.dragData : snomedConcept;

        // let index = this.registros.findIndex(r => (concept.concepto && concept.concepto.conceptId === r.concepto.conceptId));

        // this.indexEliminar = index;
        // this.confirmarEliminar = true;
    }

    crearRegistro(snomedConcept): any {
        // // si proviene del drag and drop
        // if (snomedConcept.dragData) {
        //     snomedConcept = snomedConcept.dragData;
        // }
        // let tipo;
        // switch (snomedConcept.semanticTag) {
        //     case 'trastorno':
        //     case 'hallazgo':
        //     case 'problema':
        //         tipo = 'problemas';
        //         break;
        //     case ('entidad observable'):
        //     case ('procedimiento'):
        //         if (this.tipoBusqueda === 'procedimientos') {
        //             tipo = 'procedimientos';
        //         } else {
        //             tipo = 'planes';
        //         }
        //         // data.tipo = (this.tipoBusqueda) ? 'planes' : 'procedimientos';
        //         break;
        // }

        // if (!tipo) {
        //     return false;
        // }

        // // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        // let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, snomedConcept, tipo);

        // // armamos el elemento data a agregar al array de registros
        // let data = {
        //     tipo: tipo,
        //     concepto: snomedConcept,
        //     elementoRUP: elementoRUP,
        //     valor: null,
        //     destacado: false,
        //     relacionadoCon: null
        // };
        // return data;
    }

    cargarNuevoRegistro(snomedConcept) {
        // // creamos el registro
        // let data = this.crearRegistro(snomedConcept);
        // if (!data) {
        //     return false;
        // }
        // // agregamos al array de registros
        // // this.cargarRegistroEnPosicion(this.registros.length, data);
        // this.registros.splice(this.registros.length, 0, data);
        // this.registros[this.registros.length - 1].collapse = false; // verificar.. fer
        // this.showDatosSolicitud = false;
        // for (let i in this.registros) {
        //     this.cargaItems(this.registros[i], i);
        //     // Actualizamos cuando se agrega el array..
        // }
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
        // this.colapsarPrestaciones();
        // //  this.registros = this.copiaRegistro;
        // // console.log(this.copiaRegistro);
        // //  console.log(this.registros);
        // // si tenemos mas de un registro en en el array de memoria mostramos el button de vincular.
        // if (this.registros.length > 0) {
        //     this.showVincular = true;
        // }
        // // nos fijamos si el concepto ya aparece en los registros
        // let existe = this.registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        // // si no existe, verificamos si no está en alguno de los conceptos de los elementos RUP cargados
        // if (!existe) {
        //     existe = this.registros.find(registro => {
        //         return registro.elementoRUP.conceptos.find(r => {
        //             return (r.conceptId === snomedConcept.conceptId);
        //         });
        //     });
        // }

        // if (existe) {
        //     this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
        //     return false;
        // }

        // // Buscar si es hallazgo o trastorno buscar primero si ya esxiste en Huds
        // // if (snomedConcept.semanticTag === 'hallazgo' || snomedConcept.semanticTag === 'trastorno') {
        // //     this.servicioPrestacion.getUnHallazgoPaciente(this.paciente.id, snomedConcept)
        // //         .subscribe(dato => {
        // //             if (dato) {
        // //                 // vamos a comprobar si se trata de hallazgo cronico
        // //                 if (dato.evoluciones && dato.evoluciones[0].esCronico) {
        // //                     // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        // //                     let elementoRUP = this.servicioElementosRUP.nuevaEvolucion;
        // //                     // armamos el elemento data a agregar al array de registros
        // //                     let data = {
        // //                         collapse: false,
        // //                         tipo: 'problemas',
        // //                         concepto: snomedConcept,
        // //                         elementoRUP: elementoRUP,
        // //                         valor: dato,
        // //                         destacado: false,
        // //                         relacionadoCon: null
        // //                     };
        // //                     this.registros.splice(this.registros.length, 0, data);
        // //                     if (!this.data[elementoRUP.key]) {
        // //                         this.data[elementoRUP.key] = {};
        // //                     }
        // //                     this.data[elementoRUP.key][snomedConcept.conceptId] = dato;
        // //                     for (let i in this.registros) {
        // //                         if (this.registros[i]) {
        // //                             this.cargaItems(this.registros[i], i);
        // //                         }
        // //                     }
        // //                 } else {
        // //                     this.cargarNuevoRegistro(snomedConcept);
        // //                 }
        // //             } else {
        // //                 this.cargarNuevoRegistro(snomedConcept);

        // //             }
        // //         });

        // // } else {
        // //     this.cargarNuevoRegistro(snomedConcept);
        // // }
    }

    ejecutarConceptoHuds(resultadoHuds) {
        if (resultadoHuds.tipo === 'prestacion') {
            this.ejecutarConcepto(resultadoHuds.data.solicitud.tipoPrestacion);
        } else {
            this.ejecutarConcepto(resultadoHuds.data.concepto);
        }
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

        let params: any = {
            op: 'registros',
            registros: this.prestacion.ejecucion.registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada');
            // actualizamos las prestaciones de la HUDS
            this.servicioPrestacion.getByPaciente(this.paciente.id, true, prestacionEjecutada.id).subscribe(resultado => {
                this.router.navigate(['rup/validacion', this.prestacion.id]);
            });
        });
    }

    volver() {
        this.router.navigate(['rup']);
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
        // if (dragging === true) {
        //     this.colapsarPrestaciones();
        // } else {
        //     if (this.registros.length === this.copiaRegistro.length) {
        //         this.registros = JSON.parse(JSON.stringify(this.copiaRegistro));
        //     }
        //     for (let i in this.registros) {
        //         this.cargaItems(this.registros[i], i);
        //         // Actualizamos cuando se agrega el array..
        //     }
        // }
        // this.isDraggingConcepto = dragging;
        // this.showDatosSolicitud = false;
    }
    recibeTipoBusqueda(tipoDeBusqueda) {
        this.tipoBusqueda = tipoDeBusqueda;
    }

    cargaItems(elementoRup, indice) {
        // Paso el concepto desde el que se clikeo y filtro para no mostrar su autovinculacion.
        // this.registros[indice].items = [];
        // let objItem = {};
        // this.registros[indice].items = this.registros.filter(registro => {
        //     return (registro.concepto.conceptId !== elementoRup.concepto.conceptId && elementoRup.relacionadoCon !== registro.concepto.conceptId);

        // }).map(registro => {
        //     return {
        //         label: 'vincular con: ' + registro.concepto.term,
        //         handler: () => {
        //             this.vincularRegistros(elementoRup, registro);
        //         }
        //     };
        // });
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
        // this.registros[indice].collapse = valor;
    }

    colapsarPrestaciones() {
        // if (this.registros) {
        //     this.copiaRegistro = JSON.parse(JSON.stringify(this.registros));
        //     this.registros.forEach(element => {
        //         element.collapse = true;
        //         element.items = [];
        //     });
        // }
    }
}
