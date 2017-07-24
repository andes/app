import { PacienteService } from './../../../services/paciente.service';
import { IPaciente } from './../../../interfaces/IPaciente';
import { element } from 'protractor';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// servicios
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

// interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ElementosRupService } from '../../../services/rup/elementosRUP.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.css'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})

export class PrestacionEjecucionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    // Le pasamos la prestacion que se esta ejecutando.
    //  @Input() prestacionEjecucion: object;

    // prestacion actual en ejecucion
    public prestacion: any;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;

    // concepto snomed seleccionado del buscador a ejecutar
    // public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    // public data: any[] = [];
    public data: Object = {};

    // Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda = 'problemas'; // Por defecto trae los problemas
    public showPlanes = false;
    public registros: any[] = [];
    public relacion = null;
    public conceptoARelacionar = [];

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = false;

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingRegistro: Boolean = false;
    // Opciones del desplegable para vincular y desvincular
    items = [];
    public showVincular = false;

    // variables para la vista
    public elementosRUPcollapse: any[] = [];
    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;
    public scopeEliminar: String;

    public paciente: IPaciente;
    // Mustro mpi para cambiar de paciente.
    public showCambioPaciente = false;
    showDatosSolicitud = false;
    showBotonCambioPaciente = true;
    // errores
    public errores: any[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        public servicioTipoPrestacion: TipoPrestacionService,
        private servicioPaciente: PacienteService) {
    }

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

                if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                    this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                }

                this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                    this.paciente = paciente;
                });
                this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                    this.elementosRUP = elementosRup;
                    this.elementoRUPprestacion = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion, 'procedimientos');
                    this.MostrarDatosEnEjecucion();
                });
            }, (err) => {
                if (err) {
                    this.plex.info('danger', err, 'Error');
                    this.router.navigate(['/rup']);
                }
            });

        });
    }


    MostrarDatosEnEjecucion() {
        this.registros = [];
        // this.data = [];
        if (this.prestacion) {
            // recorremos los registros ya almacenados en la prestacion y rearmamos el
            // arreglo registros y data en memoria
            this.prestacion.ejecucion.registros.forEach(registro => {
                let elementoRUPRegistro = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, registro.concepto, registro.tipo);
                // armamos el elemento data a agregar al array de registros
                let data = {
                    tipo: registro.tipo,
                    concepto: registro.concepto,
                    elementoRUP: elementoRUPRegistro,
                    valor: registro.valor,
                    destacado: registro.destacado ? registro.destacado : false,
                    relacionadoCon: registro.relacionadoCon ? registro.relacionadoCon : null
                };

                this.registros.push(data);

                if (!this.data[elementoRUPRegistro.key]) {
                    this.data[elementoRUPRegistro.key] = {};
                }

                if (!this.data[elementoRUPRegistro.key][registro.concepto.conceptId]) {
                    this.data[elementoRUPRegistro.key][registro.concepto.conceptId] = {};
                }
                this.data[elementoRUPRegistro.key][registro.concepto.conceptId] = registro.valor[elementoRUPRegistro.key];
            });
        }
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
        // buscamos el registro
        let registro = this.registros[posicionActual];

        // lo quitamos de la posicion actual
        this.registros.splice(posicionActual, 1);

        // agregamos a la nueva posicion
        this.registros.splice(posicionNueva, 0, registro);

        // quitamos relacion si existe
        if (this.registros[posicionNueva]) {
            if (this.registros[posicionNueva].relacionadoCon) {
                this.registros[posicionNueva].relacionadoCon = null;
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
        let posicionActual = this.registros.findIndex(r => (registro.dragData.concepto.conceptId === r.concepto.conceptId));

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

        // si no existe lo agrego
        let existe = this.registros.find(r => (registroOrigen.concepto && registroOrigen.concepto.conceptId === r.concepto.conceptId) || (r.concepto.conceptId === registroOrigen.conceptId));
        if (!existe) {
            this.ejecutarConcepto(registroOrigen, registroDestino);
        }

        let conceptIdOrigen = (registroOrigen.concepto) ? registroOrigen.concepto.conceptId : registroOrigen.conceptId;

        // buscamos en la posicion que se encuentra el registro de orgien y destino
        let indexOrigen = this.registros.findIndex(r => (conceptIdOrigen === r.concepto.conceptId));
        let indexDestino = this.registros.findIndex(r => (registroDestino.concepto && registroDestino.concepto.conceptId === r.concepto.conceptId) || (registroDestino.concepto.conceptId === r.concepto.conceptId));

        // solo vinculamos si no es el mismo elemento
        if (conceptIdOrigen === registroDestino.concepto.conceptId) {
            return false;
        }

        // si ya está vinculado a algun otro registro, no permitimos la vinculacion
        /*
        if (registroDestino.relacionadoCon) {
            return false;
        }
        */

        // buscamos todos los conceptos que tenga relacionados
        let relacionados = this.registros.filter(r => {
            return (r.relacionadoCon && r.relacionadoCon.conceptId === conceptIdOrigen);
        });

        /*
        // si no tiene relacion con ninguno (es padre) y no tiene elementos relacionados
        // entonces no permitimos mover el elemento
        if (relacionados.length && !registroOrigen.relacionadoCon) {
            return false;
        }
        */

        // vinculamos
        this.registros[indexOrigen].relacionadoCon = registroDestino.concepto;

        // movemos
        let _registro = this.registros[indexOrigen];
        this.registros.splice(indexOrigen, 1);
        this.registros.splice(indexDestino + 1, 0, _registro);



        // tslint:disable-next-line:forin
        for (let i in this.registros) {
            this.cargaItems(this.registros[i], i)
            // Actualizamos cuando se agrega el array..
        }
        // this.moverRegistroEnPosicion()
        /*
        if (relacionados.length) {
            relacionados.forEach(r => {
                r.relacionadoCon = null;
            });
        }
        */

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

        // quitamos relacion si existe
        if (this.registros[index].relacionadoCon) {
            this.registros[index].relacionadoCon = null;

            this.confirmarDesvincular[index] = false;

            this.moverRegistroEnPosicion(index, this.registros.length);
            // tslint:disable-next-line:forin
            for (let i in this.registros) {
                this.cargaItems(this.registros[i], i)
                // Actualizamos cuando se agrega el array..
            }
        }

        // si no tiene ningun elemento relacionado entonces es un elemento padre
        if (!this.registros[index].relacionadoCon) {
            // this.registros.splice(index, 1);
        }
    }

    /**
     * Quitamos elemento del array de registros
     * En caso de tener elementos relacionados, se les quita la relacion
     * hacia el elemento a eliminar
     * @memberof PrestacionEjecucionComponent
     */
    eliminarRegistro() {
        if (this.confirmarEliminar) {
            let _registro = this.registros[this.indexEliminar];

            // quitamos toda la vinculacion que puedan tener con el registro
            let registrosVinculados = this.registros.filter(r => {
                return (r.relacionadoCon && r.relacionadoCon.conceptId === _registro.concepto.conceptId);
            });

            registrosVinculados.forEach(registro => {
                registro.relacionadoCon = null;
            });

            // eliminamos el registro del array
            this.registros.splice(this.indexEliminar, 1);

            // limpiamos el valor de data
            delete this.data[_registro.elementoRUP.key];

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
    confirmarEliminarRegistro(snomedConcept, scope) {
        this.scopeEliminar = scope;
        let concept = (snomedConcept.dragData) ? snomedConcept.dragData : snomedConcept;

        let index = this.registros.findIndex(r => (concept.concepto && concept.concepto.conceptId === r.concepto.conceptId));

        this.indexEliminar = index;
        this.confirmarEliminar = true;
    }

    crearRegistro(snomedConcept): any {
        // si proviene del drag and drop
        if (snomedConcept.dragData) {
            snomedConcept = snomedConcept.dragData;
        }

        let tipo;
        switch (snomedConcept.semanticTag) {
            case 'trastorno':
            case 'hallazgo':
            case 'problema':
                tipo = 'problemas';
                break;
            case ('entidad observable'):
            case ('procedimiento'):
                if (this.tipoBusqueda === 'procedimientos') {
                    tipo = 'procedimientos';
                } else {
                    tipo = 'planes';
                }
                // data.tipo = (this.tipoBusqueda) ? 'planes' : 'procedimientos';
                break;
        }

        if (!tipo) {
            return false;
        }

        // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, snomedConcept, tipo);

        // armamos el elemento data a agregar al array de registros
        let data = {
            tipo: tipo,
            concepto: snomedConcept,
            elementoRUP: elementoRUP,
            valor: null,
            destacado: false,
            relacionadoCon: null
        };


        return data;
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
        // si tenemos mas de un registro en en el array de memoria mostramos el button de vincular.
        if (this.registros.length > 0) {
            this.showVincular = true;
        }

        // nos fijamos si el concepto ya aparece en los registros
        let existe = this.registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        // si no existe, verificamos si no está en alguno de los conceptos de los elementos RUP cargados
        if (!existe) {
            existe = this.registros.find(registro => {
                return registro.elementoRUP.conceptos.find(r => {
                    return (r.conceptId === snomedConcept.conceptId);
                });
            });
        }

        if (existe) {
            this.plex.toast('warning', 'El elemento seleccionado ya se encuentra agregado.');

            return false;
        }

        // creamos el registro
        let data = this.crearRegistro(snomedConcept);
        if (!data) {
            return false;
        }

        // agregamos al array de registros
        // this.cargarRegistroEnPosicion(this.registros.length, data);
        this.registros.splice(this.registros.length, 0, data);

        // agregamos el elemento al collapse
        // this.elementosRUPcollapse.push(data);
        this.elementosRUPcollapse[this.elementosRUPcollapse.length - 1] = false;


        // tslint:disable-next-line:forin
        for (let i in this.registros) {
            this.cargaItems(this.registros[i], i)
            // Actualizamos cuando se agrega el array..
        }
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
    draggingRegistro(dragging: Boolean) {
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

        if (!this.registros.length) {
            this.plex.alert('Debe agregar al menos un registro en la consulta', 'Error');
            return false;
        }

        this.registros.forEach((r, i) => {
            // for (let i = 0; i < this.registros.length; i++) {
            // let r = this.registros[i];
            this.errores[i] = null;

            // verificamos si existe algun valor a devolver en data
            if (typeof this.data[r.elementoRUP.key] === 'undefined') {
                this.errores[i] = 'Debe completar con algún valor';
                resultado = false;
            }
            // }
        });

        return resultado;
    }

    /**
     * Guardamos la prestacion y vamos hacia la pantalla de validacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    guardarPrestacion() {
        this.prestacion.ejecucion.registros = [];

        // validamos antes de guardar
        if (!this.beforeSave()) {
            return null;
        }

        this.registros.forEach(r => {
            let nuevoRegistro: any = {
                concepto: r.concepto,
                destacado: r.destacado,
                relacionadoCon: r.relacionadoCon,
                tipo: r.tipo,
                valor: {}
            };
            nuevoRegistro.valor[r.elementoRUP.key] = this.data[r.elementoRUP.key][r.concepto.conceptId];
            this.prestacion.ejecucion.registros.push(nuevoRegistro);
        });

        let params: any = {
            op: 'registros',
            registros: this.prestacion.ejecucion.registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada');
            this.router.navigate(['rup/validacion', this.prestacion.id]);
        });
    }

    /**
     * Se ejecuta cuando se devuelven valores
     * desde un átomo / molecula / fórmula desde RUP
     * @param {any} datos
     * @param {any} elementoRUP
     * @memberof PrestacionEjecucionComponent
     */
    getValoresRup(datos, elementoRUP, snomedConcept) {

        // si esta seteado el valor en data, pero no tiene ninguna key con valores dentro
        // ej: data[signosVitales]: {}
        if (this.data[elementoRUP.key] !== 'undefined' && !Object.keys(datos).length) {
            // eliminamos la prestacion de data
            delete this.data[elementoRUP.key];
        } else {
            // si no está seteada la prestacion en data
            // entonces inicializamos el objeto vacío
            if (!this.data[elementoRUP.key]) {
                this.data[elementoRUP.key] = {};
            }

            if (!this.data[elementoRUP.key][snomedConcept.conceptId]) {
                this.data[elementoRUP.key][snomedConcept.conceptId] = {};
            }

            // asignamos los valores que devuelve RUP en la variable datos
            // a nuestro array de valores data
            this.data[elementoRUP.key][snomedConcept.conceptId] = datos[elementoRUP.key];
        }

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
        this.isDraggingConcepto = dragging;
    }
    recibeTipoBusqueda(tipoDeBusqueda) {
        this.tipoBusqueda = tipoDeBusqueda;
    }

    cargaItems(elementoRup, indice) {
        // Paso el concepto desde el que se clikeo y filtro para no mostrar su autovinculacion.
        this.registros[indice].items = [];
        let objItem = {};
        this.registros[indice].items = this.registros.filter(registro => {
            return (registro.concepto.conceptId !== elementoRup.concepto.conceptId && elementoRup.relacionadoCon === null && registro.relacionadoCon === null);

        }).map(registro => {
            return {
                label: 'vincular con: ' + registro.concepto.term,
                handler: () => { this.vincularRegistros(elementoRup, registro); }
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
                this.showBotonCambioPaciente = true;
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
                        this.showCambioPaciente = false;
                    });
                });
            }
        });
    }
    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }
}
