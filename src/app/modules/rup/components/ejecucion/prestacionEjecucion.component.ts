import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexHelpComponent } from '@andes/plex/src/lib/help/help.component';
import { Component, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ConstantesService } from 'src/app/services/constantes.service';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { SnomedBuscarService } from '../../../../components/snomed/snomed-buscar.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { getRegistros, populateRelaciones, unPopulateRelaciones } from '../../operators/populate-relaciones';
import { RupEjecucionService } from '../../services/ejecucion.service';
import { HUDSService } from '../../services/huds.service';
import { PlantillasService } from '../../services/plantillas.service';
import { RUPComponent } from '../core/rup.component';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { IPrestacionRegistro } from './../../interfaces/prestacion.registro.interface';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { RecetaService } from 'projects/portal/src/app/services/receta.service';


@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None,
    providers: [
        RupEjecucionService
    ]
})
export class PrestacionEjecucionComponent implements OnInit, OnDestroy {
    @ViewChildren(RUPComponent) rupElements: QueryList<any>;

    // prestacion actual en ejecucion
    public prestacion: IPrestacion;
    public paciente: IPaciente;
    public elementoRUP: IElementoRUP;
    public prestacionesValidadas = [];
    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = false;

    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingRegistro: Boolean = false;

    // Opciones del desplegable para vincular y desvincular
    public itemsRegistros = {};
    public itemsHistorial: { [id: string]: { collapse: boolean } } = {};

    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;
    public scopeEliminar: any;

    // Mustro mpi para cambiar de paciente.
    public elementoOnDrag: any;
    public posicionOnDrag;

    // Defaults de Tabs panel derecho
    public activeIndex = 0;
    public panelIndex = 1;

    // Seteamos el concepto desde el cual se buscan sus frecuentes
    public conceptoFrecuente: any;

    // el concepto que seleccionamos para eliminar lo guradamos aca.
    public conceptoAEliminar: any;

    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = false;

    // boton de volver cuando la ejecucion tiene motivo de internacion.
    // Por defecto vuelve al mapa de camas
    public btnVolver = 'Mapa de camas';
    public rutaVolver;

    public flagValid = true;

    public search = '';

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
    onDestroy$ = new Subject();

    public hasPacs = false;

    public conceptosAsociados;

    public alerta = 'Este registro no puede modificarse, si necesita cambiar una medicación prescripta puede suspender desde la HUDS y registrar una nueva.';

    private soloValores = ['33633005'];
    conceptoSeleccionadoId: string;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private servicioPaciente: PacienteService,
        private conceptObserverService: ConceptObserverService,
        private buscadorService: SnomedBuscarService,
        public huds: HUDSService,
        public ps: PlantillasService,
        public ejecucionService: RupEjecucionService,
        public constantesService: ConstantesService,
        public recetaService: RecetaService
    ) { }

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
            } else {
                this.activeIndex = 1;
            }
            this.registrosHUDS = [...datos];
        });

        if (!this.tieneAccesoHUDS) {
            this.panelIndex = 0;
        }

        this.servicioPrestacion.clearRefSetData();

        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();
        this.route.params.subscribe(params => {
            const id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.servicioPrestacion.getById(id).pipe(
                        map(prestacion => populateRelaciones(prestacion))
                    ).subscribe(prestacion => {
                        this.prestacion = prestacion;
                        this.ejecucionService.prestacion = prestacion;

                        this.plex.updateTitle([{
                            route: '/',
                            name: 'ANDES'
                        }, {
                            route: '/rup',
                            name: 'RUP'
                        }, {
                            name: this.prestacion && this.prestacion.solicitud.tipoPrestacion.term ? this.prestacion.solicitud.tipoPrestacion.term : ''
                        }]);

                        this.hasPacs = this.prestacion.metadata?.findIndex(item => item.key === 'pacs-uid') >= 0;

                        // this.prestacion.ejecucion.registros.sort((a: any, b: any) => a.updatedAt - b.updatedAt);
                        // Si la prestación está validada, navega a la página de validación
                        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada') {
                            this.router.navigate(['/rup/validacion/', this.prestacion.id]);
                        } else {

                            // Carga la información completa del paciente
                            if (!prestacion.solicitud.tipoPrestacion.noNominalizada) {
                                this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                                    this.paciente = paciente;
                                    if (this.prestacion.groupId) {
                                        this.cargarPrestacionAsociada();
                                    }
                                    this.ejecucionService.paciente = paciente; this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                                });
                            }
                            // cambio: this.prestacionSolicitud = prestacion.solicitud;
                            // Trae el elementoRUP que implementa esta Prestación
                            this.elementoRUP = this.elementosRUPService.buscarElemento(prestacion.solicitud.tipoPrestacion, false);
                            this.prestacion.elementoRUP = this.elementoRUP.id;
                            if (this.elementoRUP.requeridos.length > 0) {
                                for (const elementoRequerido of this.elementoRUP.requeridos) {
                                    this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                                }
                            }
                            this.ejecucionService.elementoRupPrestacion = this.elementoRUP;

                            // Trae los "más frecuentes" (sugeridos) de esta Prestación
                            this.recuperaLosMasFrecuentes(prestacion.solicitud.tipoPrestacion, this.elementoRUP);

                            // Muestra los registros (y los colapsa)
                            this.mostrarDatosEnEjecucion();

                            this.prestacion.ejecucion.registros.map(x => {
                                this.ps.get(x.concepto.conceptId, x.esSolicitud).subscribe(() => { });
                            });

                            if (this.prestacion.ejecucion.registros.length === 0) {
                                this.elementosRUPService.requeridosDinamicos(
                                    this.prestacion,
                                    this.prestacion.solicitud.tipoPrestacion.conceptId
                                ).subscribe(conceptos => {
                                    conceptos.forEach(target => {
                                        if (target.tipo === 'requerido') {
                                            this.ejecucionService.agregarConcepto(target.concepto);
                                        } else {
                                            this.ejecucionService.addSugeridos([target.concepto]);
                                        }
                                    });
                                });
                            }

                            if (this.elementoRUP.requeridos.length > 0) {
                                for (const elementoRequerido of this.elementoRUP.requeridos) {
                                    const registoExiste = this.prestacion.ejecucion.registros.find(registro => registro.concepto.conceptId === elementoRequerido.concepto.conceptId);
                                    if (!registoExiste) {
                                        this.elementosRUPService.coleccionRetsetId[String(elementoRequerido.concepto.conceptId)] = elementoRequerido.params;
                                        this.ejecucionService.agregarConcepto(elementoRequerido.concepto);
                                    } else if (registoExiste.id && registoExiste.valor) {
                                        // Expandir sólo si no tienen algún valor
                                        this.itemsRegistros[registoExiste.id].collapse = false;
                                        this.itemsHistorial[registoExiste.id] = { collapse: true };

                                    }
                                }
                            }
                        }

                        this.ejecucionService.actualizar('inicializar');
                    }, (err) => {
                        if (err) {
                            this.plex.info('danger', err, 'Error');
                            this.router.navigate(['/rup']);
                        }
                    });
                }
            });
        });

        this.ejecucionService.conceptosStream().pipe(
            filter(r => !r.seccion),
            takeUntil(this.onDestroy$),
        ).subscribe((registro) => {
            const dientesOdontograma = this.servicioPrestacion.getRefSetData();
            if (dientesOdontograma && dientesOdontograma.refsetId) {
                this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, dientesOdontograma.conceptos, registro.idEvolucion);
            } else {
                this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, null, registro.idEvolucion);
            }
        });
    }

    cargarPrestacionAsociada() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            const validadas = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            this.prestacionesValidadas = validadas.filter(validada => validada.groupId === this.prestacion.groupId);
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next(null);
        this.huds.clear();
    }

    agregarSolicitud(concepto, helpSolicitudes: PlexHelpComponent) {
        helpSolicitudes.toggle();
        if (this.ejecucionService.paciente && concepto) {
            const params: any = {
                estados: [
                    'auditoria',
                    'pendiente',
                    'ejecucion'
                ],
                idPaciente: this.ejecucionService.paciente.id,
                prestacionDestino: concepto.conceptId
            };
            this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
                const existeSolicitud = resultado?.some(registro => registro.inicio === 'top');
                if (existeSolicitud) {
                    this.plex.confirm(`El paciente ya tiene una solicitud en curso para ${concepto.term}. ¿Desea continuar?`, 'Paciente con solicitud en curso').then(confirmar => {
                        if (confirmar) {
                            this.ejecucionService.agregarConcepto(concepto, true);
                        }
                    });
                } else {
                    this.ejecucionService.agregarConcepto(concepto, true);
                }
            });
        } else {
            this.ejecucionService.agregarConcepto(concepto, true);
        }
    }

    public onCloseTab(index) {
        this.huds.remove(index - 2);
        if (this.detalleRegistrosHUDS && this.detalleConceptoHUDS) {
            this.detalleRegistrosHUDS = null;
            this.detalleConceptoHUDS = null;
            this.activeIndex = 0;
        }
    }
    public onChangeTab(event: any) {
        if (event.type === 'change' && event?.target?.id?.includes('selectized')) { // fix para que no se cierre el tab al abrir el select pero no seleccionar un item
            return;
        }
        this.activeIndex = event;
    }

    buscar() {
        this.buscadorService.setBuscado(this.search);
    }

    /**
     * recorre los registros de una prestación que ya tiene registros en ejecución
     * y los carga el array itemsRegistros para colapsar y para los registros que se puedan relacionar (items).
     * @memberof PrestacionEjecucionComponent
     */
    mostrarDatosEnEjecucion() {
        if (this.prestacion) {
            this.prestacion.ejecucion.registros.forEach(registro => {
                this.itemsRegistros[registro.id] = { collapse: false, items: null };
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
        const posicionActual = this.prestacion.ejecucion.registros.findIndex(r => (registro.id === r.id));

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
            const registros = this.prestacion.ejecucion.registros;
            const _registro = registros[this.indexEliminar];

            // Quitamos toda la vinculación que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {

                    // relacionadoCon está populado, y debe comprobarse el id
                    const indexRel = registro.relacionadoCon.findIndex(x => x && x.id && x.id === _registro.id);
                    if (indexRel !== -1) {
                        registro.relacionadoCon.slice(indexRel, 1);
                    }
                }
            });

            // eliminamos el registro del array
            registros.splice(this.indexEliminar, 1);
            this.indexEliminar = null;
            this.confirmarEliminar = false;
            this.scopeEliminar = '';
            this.ejecucionService.actualizar('eliminar');
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

    puedeEliminar(registro) {
        if (this.esSoloValores(registro)) {
            return false;
        }

        const esAsociado = this.prestacion.ejecucion.registros.some(r =>
            r.valor?.medicamentos?.length && r.valor.medicamentos.some(m => m.diagnostico.conceptId === registro.concepto.conceptId)
        );

        return !esAsociado;
    }

    cargarNuevoRegistro(snomedConcept, esSolicitud: boolean, valor = null, relaciones, idEvolucion) {
        const elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        this.elementosRUPService.coleccionRetsetId[String(snomedConcept.conceptId)] = elementoRUP.params;

        if (snomedConcept.semanticTag === 'procedimiento' || snomedConcept.semanticTag === 'elemento de registro' || snomedConcept.semanticTag === 'régimen/tratamiento' || snomedConcept.semanticTag === 'situación') {
            this.ps.get(snomedConcept.conceptId, esSolicitud).subscribe(() => { });
        }

        // armamos el elemento data a agregar al array de registros
        const nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept, this.prestacion);
        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
        nuevoRegistro['_id'] = nuevoRegistro.id;

        nuevoRegistro.idEvolucion = idEvolucion;

        // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;

        if (!relaciones) {
            if (this.prestacion && this.prestacion.ejecucion.registros && this.prestacion.ejecucion.registros.length) {
                const registroRequerido = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === PrestacionesService.InformeDelEncuentro);
                if (registroRequerido) {
                    nuevoRegistro.relacionadoCon.push(registroRequerido);
                }
            }
        } else {
            nuevoRegistro.relacionadoCon = [...relaciones];
        }

        // Agregamos al array de registros
        this.prestacion.ejecucion.registros = [...this.prestacion.ejecucion.registros, nuevoRegistro];
        this.activeIndex = 0;

        this.ejecucionService.actualizar('cargar');

        return nuevoRegistro;
    }



    /**
     * Recibe un conpecto de la HUDS para ejecutarlo
     * @param resultadoHuds concepto de la HUDS puede ser un hallazgo o una prestación
     */
    ejecutarConceptoHuds(resultadoHuds) {
        if (resultadoHuds.tipo === 'prestacion') {
            // this.ejecutarConcepto(resultadoHuds.data.solicitud.tipoPrestacion);
        } else {
            const idRegistroOrigen = resultadoHuds.data.evoluciones[0].idRegistro;

            const existeEjecucion = this.prestacion.ejecucion.registros.find((registro) => {
                return (registro.valor) && (registro.valor.idRegistroOrigen) && (registro.valor.idRegistroOrigen === idRegistroOrigen);
            });

            if (!existeEjecucion) {
                const valor = { idRegistroOrigen: idRegistroOrigen };
                window.setTimeout(() => {
                    // let resultado = this.cargarNuevoRegistro(resultadoHuds.data.concepto, valor);
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
            const instance = item.rupInstance;
            instance.checkEmpty();
            this.flagValid = this.flagValid && (instance.soloValores || instance.validate());
        });
        // validamos antes de guardar
        if (!this.beforeSave() || !this.flagValid) {
            this.plex.toast('danger', 'Revise los campos cargados');
            return;
        }
        const backupRegistros = JSON.parse(JSON.stringify(this.prestacion));
        unPopulateRelaciones(backupRegistros);
        const registros = JSON.parse(JSON.stringify(backupRegistros.ejecucion.registros));

        const params: any = {
            op: 'registros',
            solicitud: backupRegistros.solicitud,
            registros: registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).pipe(
            switchMap(() => {
                this.plex.toast('success', 'Prestación guardada correctamente', 'Prestacion guardada', 100);
                if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
                    this.prestacion = backupRegistros;
                    // Actualizamos las prestaciones de la HUDS
                    return this.servicioPrestacion.getByPaciente(this.paciente.id, true).pipe(
                        tap(() => this.servicioPrestacion.clearRefSetData()),
                    );
                }
                return of(null);
            })
        ).subscribe(() => {
            this.router.navigate(['rup/validacion', this.prestacion.id]);
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

        if (ruta) {
            mensaje = this.btnVolver;
            ruteo = ruta;
        } else {
            if (ambito === 'ambulatorio') {
                mensaje = 'Punto de Inicio';
                ruteo = 'rup';
            } else if (ambito === 'internacion') {
                mensaje = 'Mapa de Camas';
                ruteo = '/mapa-camas';
            }
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
        const { esSolicitud, term, fsn, semanticTag, conceptId } = e.dragData;
        this.ejecucionService.agregarConcepto(
            {
                fsn, term, semanticTag, conceptId
            },
            esSolicitud,
            false
        );
    }

    arrastrandoConcepto(dragging: boolean) {
        this.isDraggingConcepto = dragging;
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
        const registros = getRegistros(this.prestacion);
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

    cambiaValorCollapse(indice: string) {
        if (this.itemsRegistros[indice]) {
            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
    }

    cambiaValorHistorial(id: string) {
        if (!this.itemsHistorial[id]) {
            this.itemsHistorial[id] = { collapse: true };
        }
        this.itemsHistorial[id].collapse = !this.itemsHistorial[id].collapse;
    }

    toggleCollapse() {
        this.collapse = !this.collapse;
        if (this.prestacion.ejecucion.registros) {
            this.prestacion.ejecucion.registros.forEach(element => {
                if (this.itemsRegistros[element.id]) {
                    this.itemsRegistros[element.id].collapse = this.collapse;
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
        const masFrecuentes = [];
        if (!elementoRUP && concepto) {
            elementoRUP = this.elementosRUPService.buscarElemento(concepto, false);
        }
        if (elementoRUP && elementoRUP.frecuentes) {
            elementoRUP.frecuentes.forEach(element => {
                masFrecuentes.push(element);
            });
        } else {
            // si no hay por un registro en particular mostramos el de la consulta
            if (this.elementoRUP && this.elementoRUP.frecuentes) {
                this.elementoRUP.frecuentes.forEach(element => {
                    masFrecuentes.push(element);
                });
            }
        }
        setTimeout(() => {
            this.ejecucionService.addSugeridos(masFrecuentes);
        }, 0);
    }

    // Actualiza ambas columnas de registros según las relaciones
    armarRelaciones(registros) {
        registros = this.prestacion.ejecucion.registros;
        const relacionesOrdenadas = [];

        registros.forEach((cosa, index) => {
            const esPadre = registros.filter(x => x.relacionadoCon[0] ? x.relacionadoCon[0] === cosa.id : false);

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
            for (const registro of registroDestino.relacionadoCon) {
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
            const unRegistro = this.itemsRegistros[registro.id].collapse;
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
        const scopeCruzado = { 'public': 'private', 'private': 'public' };
        registro.privacy.scope = scopeCruzado[registro.privacy.scope];
    }

    toggleVerMasRelaciones(item) {
        this.verMasRelaciones[item] = !this.verMasRelaciones[item];
    }

    checkPlantilla(registro) {

        const checkSemtag = registro.concepto.semanticTag === 'procedimiento' || registro.concepto.semanticTag === 'elemento de registro' || registro.concepto.semanticTag === 'régimen/tratamiento' || registro.concepto.semanticTag === 'situación';

        return checkSemtag;
    }

    onPacs() {
        this.servicioPrestacion.visualizarImagen(this.prestacion);
    }

    onEditIndicacion(indicacion) {
        this.ejecucionService.agregarConcepto(
            indicacion.concepto,
            true,
            null,
            indicacion.valor,
            {
                idEvolucion: indicacion.idRegistro
            }
        );
    }

    onSelectConcepto(concepto) {
        this.ejecucionService.agregarConcepto({
            term: concepto.term,
            fsn: concepto.fsn,
            conceptId: concepto.conceptId,
            semanticTag: concepto.semanticTag
        }, concepto.esSolicitud);
        this.activeIndex = 0;
    }

    prestacionVisible(registro) {
        return registro.data.class === 'plan' || registro.data.class === 'regimen' ||
            registro.data.class === 'elementoderegistro' || registro.data.class === 'producto';
    }

    esSoloValores(registro: any): boolean {
        if (this.soloValores.includes(registro.concepto?.conceptId)) {
            // Verificar si el registro ya existe en la prestación con medicamentos cargados
            const registroExistente = registro.valor?.medicamentos?.length > 0;

            if (!registroExistente) {
                return false;
            }

            const valido = this.ejecucionService.validarConcepto(registro.concepto);

            return !valido;
        }

        return false;
    }
}
