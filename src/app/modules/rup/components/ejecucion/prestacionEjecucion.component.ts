import { IPrestacionRegistro } from './../../interfaces/prestacion.registro.interface';
import { Component, OnInit, HostBinding, ViewEncapsulation, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { RUPComponent } from '../core/rup.component';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { SnomedBuscarService } from '../../../../components/snomed/snomed-buscar.service';
import { HUDSService } from '../../services/huds.service';

import { PlantillasService } from '../../services/plantillas.service';

import { SeguimientoPacienteService } from '../../services/seguimientoPaciente.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class PrestacionEjecucionComponent implements OnInit, OnDestroy {
    idAgenda: any;
    @HostBinding('class.plex-layout') layout = true;
    @ViewChildren(RUPComponent) rupElements: QueryList<any>;

    // prestacion actual en ejecucion
    public prestacion: IPrestacion;
    public paciente: IPaciente;
    public elementoRUP: IElementoRUP;
    public prestacionSolicitud;

    public showPlanes = false;
    public relacion = null;
    public conceptoARelacionar = [];

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
    public scopeEliminar: any;

    // Mustro mpi para cambiar de paciente.
    public showCambioPaciente = false;
    public showDatosSolicitud = false;
    public showPrestacion = false;
    public elementoOnDrag: any;
    public posicionOnDrag;
    // Copia del registro actual para volver todo a la normalidad luego de hacer el drop.
    public copiaRegistro: any;
    // errores
    public errores: any[] = [];

    public registroATransformar: IPrestacionRegistro;

    public masFrecuentes: any[] = [];

    // Defaults de Tabs panel derecho
    public activeIndex = 0;
    public panelIndex = 0;

    public prestacionValida = true;
    public mostrarMensajes = false;
    // Seteamos el concepto desde el cual se buscan sus frecuentes
    public conceptoFrecuente: any;

    // el concepto que seleccionamos para eliminar lo guradamos aca.
    public conceptoAEliminar: any;

    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = true;

    // boton de volver cuando la ejecucion tiene motivo de internacion.
    // Por defecto vuelve al mapa de camas
    public btnVolver = 'Mapa de camas';
    public rutaVolver;

    public flagValid = true;

    public scopePrivacy = [];
    public registrosHUDS = [];
    public tieneAccesoHUDS: Boolean;

    // Seguimiento Paciente San Juan
    public flagSeguimiento = false;

    // Historial HUDS de registros relacionados a un concepto
    detalleConceptoHUDS: any;
    detalleRegistrosHUDS: any;
    verMasRelaciones: any[] = [];

    public activeIndexResumen = 0;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        public servicioTipoPrestacion: TipoPrestacionService,
        private servicioPaciente: PacienteService,
        private servicioAgenda: AgendaService,
        private conceptObserverService: ConceptObserverService,
        private buscadorService: SnomedBuscarService,
        public huds: HUDSService,
        public ps: PlantillasService,
        public seguimientoPacienteService: SeguimientoPacienteService
    ) {
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
        this.tieneAccesoHUDS = this.auth.check('huds:visualizacionHuds');
        this.buscadorService.search('');
        // consultamos desde que pagina se ingreso para poder volver a la misma
        this.servicioPrestacion.rutaVolver.subscribe((resp: any) => {
            if (resp) {
                this.btnVolver = resp.nombre;
                this.rutaVolver = resp.ruta;
            }
        });

        this.huds.registrosHUDS.subscribe((datos) => {
            if (this.registrosHUDS.length < datos.length) {
                this.activeIndex = datos.length + 2;
            } else if (this.activeIndex > datos.length) {
                this.activeIndex = this.activeIndex - 1;
            }
            this.registrosHUDS = [...datos];
        });

        this.servicioPrestacion.clearRefSetData();


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

                        this.plex.updateTitle([{
                            route: '/',
                            name: 'ANDES'
                        }, {
                            route: '/rup',
                            name: 'RUP'
                        }, {
                            name: this.prestacion && this.prestacion.solicitud.tipoPrestacion.term ? this.prestacion.solicitud.tipoPrestacion.term : ''
                        }]);


                        // this.prestacion.ejecucion.registros.sort((a: any, b: any) => a.updatedAt - b.updatedAt);
                        // Si la prestación está validada, navega a la página de validación
                        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                            this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                        } else {

                            // Carga la información completa del paciente
                            if (!prestacion.solicitud.tipoPrestacion.noNominalizada) {
                                this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                                    this.paciente = paciente;
                                    this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                                    if (paciente) {
                                        this.registroSeguimiento();
                                    }
                                });
                            }
                            // cambio: this.prestacionSolicitud = prestacion.solicitud;
                            // Trae el elementoRUP que implementa esta Prestación
                            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
                            this.prestacion.elementoRUP = this.elementoRUP.id;
                            if (this.elementoRUP.requeridos.length > 0) {
                                for (let elementoRequerido of this.elementoRUP.requeridos) {
                                    this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                                }
                            }

                            // Trae los "más frecuentes" (sugeridos) de esta Prestación
                            this.recuperaLosMasFrecuentes(prestacion.solicitud.tipoPrestacion, this.elementoRUP);

                            // Muestra los registros (y los colapsa)
                            this.mostrarDatosEnEjecucion();

                            this.prestacion.ejecucion.registros.map(x => {
                                this.ps.get(x.concepto.conceptId, x.esSolicitud).subscribe(() => { });
                            });

                            if (this.elementoRUP.requeridos.length > 0) {
                                for (let elementoRequerido of this.elementoRUP.requeridos) {
                                    let registoExiste = this.prestacion.ejecucion.registros.find(registro => registro.concepto.conceptId === elementoRequerido.concepto.conceptId);
                                    if (!registoExiste) {
                                        this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                                        this.ejecutarConcepto(elementoRequerido.concepto);
                                    } else if (registoExiste.id && registoExiste.valor) {
                                        // Expandir sólo si no tienen algún valor
                                        this.itemsRegistros[registoExiste.id].collapse = false;
                                    }
                                }
                            }
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

    ngOnDestroy() {
        this.huds.clear();
    }

    /**
     *
     */

    public onCloseTab(index) {
        this.huds.remove(index - 2);
        if (this.detalleRegistrosHUDS && this.detalleConceptoHUDS) {
            this.detalleRegistrosHUDS = null;
            this.detalleConceptoHUDS = null;
            this.activeIndex = 0;
        }
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
                this.itemsRegistros[registro.id] = { collapse: true, items: null };
                // Si el registro actual tiene registros vinculados, los "populamos"
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    registro.relacionadoCon.forEach((registroRel, key) => {
                        let esRegistro = this.prestacion.ejecucion.registros.find(r => r.id === registroRel);
                        // Es registro RUP o es un concepto puro?
                        if (esRegistro) {
                            registro.relacionadoCon[key] = esRegistro;
                        } else {
                            registro.relacionadoCon[key] = registroRel;
                        }
                    });
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
        const registro = this.prestacion.ejecucion.registros[posicionActual];
        this.prestacion.ejecucion.registros.splice(posicionActual, 1);
        this.prestacion.ejecucion.registros.splice(posicionNueva, 0, registro);
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
        // Verificamos si ya esta vinculado no dejar que se vinculen de nuevo
        const tieneVinculacion = this.tieneVinculacion(registroOrigen, registroDestino);
        if (tieneVinculacion) {
            this.plex.toast('warning', 'Los elementos seleccionados ya se encuentran vinculados.');
            return false;
        }

        if (registroOrigen) {
            if (!registroOrigen.relacionadoCon) {
                registroOrigen.relacionadoCon = [];
            }

            if (this.elementoRUP.reglas && this.elementoRUP.reglas.requeridos && this.elementoRUP.reglas.requeridos.relacionesMultiples) {
                registroOrigen.relacionadoCon.push(registroDestino);
            } else {
                registroOrigen.relacionadoCon = [registroDestino];
            }
        } else {
            return false;
        }
    }

    mostrarVinculacion(registro) {
        if (!this.confirmarDesvincular[registro.id].cara) {
            return registro.relacionadoCon.find(x => x.concepto.conceptId === this.confirmarDesvincular[registro.id].concepto.conceptId);
        } else {
            return registro.relacionadoCon.find(x => x.concepto.conceptId === this.confirmarDesvincular[registro.id].concepto.conceptId && this.confirmarDesvincular[registro.id].cara === x.cara);
        }
    }

    /**
     * Mostrar opciones de confirmación de desvinculación
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    desvincular(registroActual, registroDesvincular) {
        this.confirmarDesvincular[registroActual.id] = (registroDesvincular.id ? registroDesvincular : registroDesvincular);
    }

    /**
     * Quitamos vinculación de los registros
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    confirmarDesvinculacion(registro, index) {

        const registroId = registro.id ? registro.id : registro.concepto.conceptId;
        const registroActual = this.prestacion.ejecucion.registros.find(r => r.id === registroId || r.concepto && r.concepto.conceptId === registroId);

        // Existe relación?
        if (registroActual) {
            if (this.confirmarDesvincular[registroId] && !this.confirmarDesvincular[registroId].cara) {
                registroActual.relacionadoCon = registroActual.relacionadoCon.filter(rr => rr.id !== this.confirmarDesvincular[registroId].id && rr.concepto.conceptId !== this.confirmarDesvincular[registroId].concepto.conceptId);
            } else {

                registroActual.relacionadoCon = this.elementosRUPService.desvincularOdontograma(this.confirmarDesvincular, registroActual, registroId);

                const cara = this.confirmarDesvincular[registroId].cara;
                const term = this.confirmarDesvincular[registroId].concepto.term;
                registroActual.relacionadoCon = registroActual.relacionadoCon.filter(rr => rr.cara !== cara || rr.concepto.term !== term);
            }
            delete this.confirmarDesvincular[registroId];
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
            const _registro = registros[this.indexEliminar];

            // Quitamos toda la vinculación que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {

                    // relacionadoCon está populado, y debe comprobarse el id
                    let indexRel = registro.relacionadoCon.findIndex(x => x && x.id && x.id === _registro.id);
                    if (indexRel !== -1) {
                        registro.relacionadoCon.slice(indexRel, 1);
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

        // Si proviene del drag and drop
        if (typeof snomedConcept.conceptId === 'undefined') {
            snomedConcept = snomedConcept[1];
        }
        // Elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let esSolicitud = false;

        // Si es un plan seteamos el true para que nos traiga el elemento rup por default
        if (snomedConcept.semanticTag === 'plan') {
            esSolicitud = true;
        }
        let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        this.elementosRUPService.coleccionRetsetId[String(snomedConcept.conceptId)] = elementoRUP.params;

        if (snomedConcept.semanticTag === 'procedimiento' || snomedConcept.semanticTag === 'elemento de registro' || snomedConcept.semanticTag === 'régimen/tratamiento') {
            this.ps.get(snomedConcept.conceptId, esSolicitud).subscribe(() => { });
        }

        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
        nuevoRegistro['_id'] = nuevoRegistro.id;

        // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;

        if (this.prestacion && this.prestacion.ejecucion.registros && this.prestacion.ejecucion.registros.length) {
            // TODO:: Por ahora la vinculacion automatica es solo con INFORME DEL ENCUENTRO
            let registroRequerido = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === PrestacionesService.InformeDelEncuentro);
            if (registroRequerido) {
                nuevoRegistro.relacionadoCon.push(registroRequerido);
            }
        }
        //


        //
        // Agregamos al array de registros
        this.prestacion.ejecucion.registros = [...this.prestacion.ejecucion.registros, nuevoRegistro];
        this.showDatosSolicitud = false;
        // this.recuperaLosMasFrecuentes(snomedConcept, elementoRUP);
        return nuevoRegistro;
    }


    /**
     * Al hacer clic en un resultado de SNOMED search se ejecuta esta funcion
     * y se agrega a un array de elementos en ejecucion el elemento rup perteneciente
     * a dicho concepto de snomed
     * @param {any} snomedConcept
     */
    ejecutarConcepto(snomedConcept) {
        if (snomedConcept[0] && snomedConcept[0][0] === 'planes') {
            snomedConcept = JSON.parse(JSON.stringify(snomedConcept[1]));
            snomedConcept.semanticTag = 'plan';
        } else {
            if (snomedConcept[1]) {
                snomedConcept = JSON.parse(JSON.stringify(snomedConcept[1]));
            }
        }

        const dientesOdontograma = this.servicioPrestacion.getRefSetData();

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


        if (registoExiste) {
            this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
            return false;
        }

        // Buscar si es hallazgo o trastorno buscar primero si ya existe en Huds

        if ((snomedConcept.semanticTag === 'hallazgo' || snomedConcept.semanticTag === 'trastorno' || snomedConcept.semanticTag === 'situación') && (!this.elementoRUP.reglas || !this.elementoRUP.reglas.requeridos || !this.elementoRUP.reglas.requeridos.relacionesMultiples)) {
            this.servicioPrestacion.getUnTrastornoPaciente(this.paciente.id, snomedConcept)
                .subscribe(dato => {
                    if (dato) {
                        if (dato.evoluciones[0].estado === 'activo') {
                            this.plex.confirm('¿Desea evolucionar el mismo?', 'El problema ya se encuentra registrado').then((confirmar) => {
                                if (confirmar) {

                                    valor = {
                                        idRegistroOrigen: dato.evoluciones[0].idRegistro
                                    };

                                    resultado = this.cargarNuevoRegistro(snomedConcept, valor);

                                    if (dientesOdontograma && dientesOdontograma.refsetId) {
                                        resultado.relacionadoCon = dientesOdontograma.conceptos;
                                    }

                                } else {

                                    resultado = this.cargarNuevoRegistro(snomedConcept);
                                    if (resultado && dientesOdontograma && dientesOdontograma.refsetId) {
                                        resultado.relacionadoCon = dientesOdontograma.conceptos;
                                    }
                                }
                            });
                        }
                    } else {
                        resultado = this.cargarNuevoRegistro(snomedConcept);
                        if (resultado && dientesOdontograma && dientesOdontograma.refsetId) {
                            resultado.relacionadoCon = dientesOdontograma.conceptos;
                        }
                    }
                });
        } else {
            resultado = this.cargarNuevoRegistro(snomedConcept);
            if (dientesOdontograma && dientesOdontograma.conceptos && dientesOdontograma.refsetId) {
                resultado.relacionadoCon = dientesOdontograma.conceptos;
            }
        }
    }

    /**
     * Recibe un conpecto de la HUDS para ejecutarlo
     * @param resultadoHuds concepto de la HUDS puede ser un hallazgo o una prestación
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
        if (!this.prestacion.ejecucion.registros.length || (this.prestacion.ejecucion.registros.length === 1 && this.prestacion.ejecucion.registros[0].concepto.conceptId === '721145008')) {
            this.plex.info('warning', 'Debe agregar al menos un registro en la consulta', 'Error');
            return false;
        }
        return true;

    }

    /**
     * Guardamos la prestacion y vamos hacia la pantalla de validacion
     *
     * @returns
     * @memberof PrestacionEjecucionComponent
     */
    guardarPrestacion() {
        this.flagValid = true;
        this.rupElements.forEach((item) => {
            let instance = item.rupInstance;
            instance.checkEmpty();
            this.flagValid = this.flagValid && (instance.soloValores || instance.validate());
        });
        // validamos antes de guardar
        if (!this.beforeSave() || !this.flagValid) {
            this.plex.toast('danger', 'Revise los campos cargados');
            return;
        }

        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));

        registros.forEach(registro => {

            if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                registro.relacionadoCon.forEach((registroRel, key) => {
                    let esRegistro = this.prestacion.ejecucion.registros.find(r => {
                        if (r.id) {
                            return r.id === registroRel;
                        } else {
                            return r.concepto.conceptId === registroRel;
                        }
                    });
                    // Es registro RUP o es un concepto puro?
                    if (esRegistro) {
                        registro.relacionadoCon[key] = esRegistro;
                    } else {
                        registro.relacionadoCon[key] = registroRel;
                    }
                });
            }
        });

        let params: any = {
            op: 'registros',
            solicitud: this.prestacion.solicitud,
            registros: registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
            this.plex.toast('success', 'Prestación guardada correctamente', 'Prestacion guardada', 100);
            if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                // Si existe un turno y una agenda asociada, y existe un concepto que indica que el paciente no concurrió a la consulta...
                if (this.idAgenda) {
                    localStorage.removeItem('idAgenda');

                    // Se hace un patch en el turno para indicar que el paciente no asistió (turno.asistencia = "noAsistio")
                    let cambios;
                    this.servicioPrestacion.prestacionPacienteAusente().subscribe(
                        result => {
                            let filtroRegistros = this.prestacion.ejecucion.registros.filter(x => result.find(y => y.conceptId === x.concepto.conceptId));
                            if (filtroRegistros && filtroRegistros.length > 0) {

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
                        });
                }
                // Actualizamos las prestaciones de la HUDS
                this.servicioPrestacion.getByPaciente(this.paciente.id, true).subscribe(resultado => {
                    this.servicioPrestacion.clearRefSetData();
                    this.router.navigate(['rup/validacion', this.prestacion.id]);
                });
            } else {
                this.router.navigate(['rup/validacion', this.prestacion.id]);
            }
        });
    }
    /**
     * Setea el boton volver, Segun la ruta que recibe y el
     *  ambito de origen de la prestacion
     * @param ambito
     * @param ruta
     */
    volver(ambito = 'ambulatorio', ruta = null) {
        let mensaje;
        let ruteo;
        switch (ambito) {
            case 'ambulatorio':
                mensaje = 'Punto de Inicio';
                ruteo = 'rup';
                break;
            case 'internacion':
                if (ruta) {
                    mensaje = 'Punto de Inicio';
                    ruteo = ruta;
                } else {
                    mensaje = 'Mapa de Camas';
                    ruteo = '/internacion/mapa-camas';
                }
                break;
            default:
                break;
        }
        // let mensaje = ambito === 'ambulatorio' ? 'Punto de Inicio' : 'Mapa de Camas';
        this.plex.confirm('<i class="mdi mdi-alert"></i> Se van a perder los cambios no guardados', '¿Volver al ' + mensaje + '?').then(confirmado => {
            if (confirmado) {
                this.router.navigate([ruteo]);
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
    }


    // Búsqueda que filtra según concepto
    recibirAccion(datosRecibidos, destino = 'tab') {
        if (destino === 'tab') {
            this.detalleConceptoHUDS = datosRecibidos.evento.datos[0];
            this.detalleConceptoHUDS['caraCuadrante'] = datosRecibidos.evento.datos[1];
            this.detalleRegistrosHUDS = datosRecibidos.evento.datos[2];
            this.activeIndex = this.activeIndex + 2;
        }
        datosRecibidos = null;
    }

    cargaItems(registroActual, indice) {
        // Paso el concepto desde el que se clickeo y filtro para no mostrar su autovinculación.
        let registros = this.prestacion.ejecucion.registros;
        this.itemsRegistros[registroActual.id].items = [];
        this.itemsRegistros[registroActual.id].items = registros.filter(registro => {
            if (registro.id !== registroActual.id) {
                if (registroActual.relacionadoCon && registroActual.relacionadoCon.length > 0) {
                    if (registroActual.relacionadoCon.findIndex(x => x.id !== registro.id) > -1) {
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

    mostrarDatosSolicitud(bool) {
        this.showDatosSolicitud = bool;
    }

    cambiaValorCollapse(indice) {
        if (this.itemsRegistros[indice]) {
            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
        // this.registrosColapsados();
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
    }

    // Actualiza ambas columnas de registros según las relaciones
    armarRelaciones(registros) {

        registros = this.prestacion.ejecucion.registros;

        let relacionesOrdenadas = [];

        registros.forEach((cosa, index) => {
            let esPadre = registros.filter(x => x.relacionadoCon[0] ? x.relacionadoCon[0] === cosa.id : false);

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
    tieneVinculacion(registroOrigen, registroDestino) {
        let control = false;
        if (this.recorreArbol(registroDestino, registroOrigen)) {
            return true;
        }
        if (registroOrigen === registroDestino) {
            return true;
        }
        if (registroOrigen.relacionadoCon && registroOrigen.relacionadoCon.length > 0) {
            control = registroOrigen.relacionadoCon.find(registro => registro.id === registroDestino.id || registro.concepto.conceptId === registroDestino.concepto.conceptId);
        }
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            control = registroDestino.relacionadoCon.find(registro => registro.id === registroOrigen.id || registro.concepto.conceptId === registroOrigen.concepto.conceptId);
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
                if (registro.id === registroOrigen.id || registro.concepto.conceptId === registroOrigen.concepto.conceptId) {
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

    registrosColapsados() {
        this.prestacion.ejecucion.registros.forEach(registro => {
            let unRegistro = this.itemsRegistros[registro.id].collapse;
            if (unRegistro !== this.collapse) {
                this.collapse = !this.collapse;
            }
        });
    }

    onChangePrivacy(registro) {
        this.scopePrivacy = [];
        this.scopePrivacy = [{
            label: registro.privacy.scope === 'public' ? 'Activar privacidad' : 'Desactivar privacidad',
            handler: () => {
                this.activarPrivacidad(registro);
            }
        }];
    }

    activarPrivacidad(registro) {
        let scopeCruzado = { 'public': 'private', 'private': 'public' };
        registro.privacy.scope = scopeCruzado[registro.privacy.scope];
    }
    toggleVerMasRelaciones(item) {
        this.verMasRelaciones[item] = !this.verMasRelaciones[item];
    }

    checkPlantilla(registro) {

        const checkSemtag = registro.concepto.semanticTag === 'procedimiento' || registro.concepto.semanticTag === 'elemento de registro' || registro.concepto.semanticTag === 'régimen/tratamiento';

        return checkSemtag;
    }

    registroSeguimiento() {
        // Se evalúa si hay registros de seguimiento
        this.seguimientoPacienteService.getRegistros({ paciente: this.paciente.id }).subscribe(seguimientoPaciente => {
            if (seguimientoPaciente.length) {
                this.flagSeguimiento = true;
            } else {
                this.flagSeguimiento = false;
            }
        });
    }

}
