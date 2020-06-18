import { Plex } from '@andes/plex';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges, Renderer2 } from '@angular/core';
import { PrestacionesService } from '../../services/prestaciones.service';
import { FrecuentesProfesionalService } from '../../services/frecuentesProfesional.service';
import { Auth } from '@andes/auth';
import { IPrestacion } from './../../interfaces/prestacion.interface';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { ISnomedSearchResult } from './../../interfaces/snomedSearchResult.interface';
import { SnomedBuscarService } from '../../../../components/snomed/snomed-buscar.service';
import { gtag } from '../../../../shared/services/analytics.service';

@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']
})

export class BuscadorComponent implements OnInit, OnChanges {
    autofocus: any;
    @Input() _draggable: Boolean = false; // TODO Ver si lo sacamos.
    // Son los mas frecuentes del elemento rup.(tipo de prestación)
    @Input() frecuentesTipoPrestacion;
    @Input() showFrecuentesTipoPrestacion;
    @Input() conceptoFrecuente;
    @Input() prestacion: IPrestacion;
    @Input() busquedaRefSet: any = {};
    /**
     * Devuelve un elemento seleccionado.
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();
    // Emito cuando tengo un resultado de la busqueda.
    @Output() tengoResultado: EventEmitter<any> = new EventEmitter<any>();

    // TODOO Ver el tag con ele tipo de busqueda

    @Output() _tipoDeBusqueda: EventEmitter<any> = new EventEmitter<any>();
    @Output() tagBusqueda: EventEmitter<any> = new EventEmitter<any>();
    @Output() filtroRefSet: EventEmitter<any> = new EventEmitter<any>();
    // Lista de planes.
    public listaPlanes: any[] = [];
    // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    public elementRef;
    public arrayPorRefsets = [];

    // Arra de salida para los mas frecuentes del profesional
    public arrayFrecuentes: any[] = [];
    // Boolean para mostrar lo mas fecuentes
    public showFrecuentes = false;


    // TODO Ver si lo dejamos asi
    public _dragScope = ['registros-rup', 'vincular-registros-rup'];

    public conceptosTurneables: any[];

    public conceptos = {
        hallazgos: ['hallazgo', 'situación', 'evento'],
        trastornos: ['trastorno'],
        procedimientos: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        planes: ['procedimiento', 'régimen/tratamiento'],
        productos: ['producto', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico'],
        otros: ['elemento de registro']
    };

    public busquedaPorConcepto = false;

    // posibles valores para el filtro actual: 'hallazgos', 'trastornos', 'procedimientos', 'planes', 'productos'
    public filtroActual: 'hallazgos' | 'trastornos' | 'procedimientos' | 'planes' | 'productos' | 'todos';

    // posibles valores para la búsqueda actual: 'todos', 'misFrecuentes', 'sugeridos', 'buscadorBasico'
    public busquedaActual: any;

    // objeto de resultados
    public results: ISnomedSearchResult = { todos: [], misFrecuentes: [], sugeridos: [], buscadorBasico: [], frecuentesTP: [] };
    public resultsAux: any;

    // public totalesTodos: Number = 0;

    public copiaFiltroActual: any;

    private opcionDesplegada: String = null;

    public search; // buscador de sugeridos y mis frecuentes
    refSet: any;

    secciones: any;

    constructor(
        public servicioTipoPrestacion: TipoPrestacionService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService,
        private buscadorService: SnomedBuscarService,
        public renderer: Renderer2
    ) {
    }


    async ngOnInit() {
        this.busquedaRefSet = this.servicioPrestacion.getRefSetData();
        // inicializamos variable resultsAux con la misma estructura que results
        this.resultsAux = Object.assign({}, this.results);
        // inicializamos el filtro actual para los hallazgos
        this.filtroActual = 'todos';
        // Se inicializa el buscador básico, principal
        await this.inicializarBuscadorBasico();

    }

    inicializarBuscadorBasico() {
        this.busquedaActual = 'buscadorBasico';
        this.servicioTipoPrestacion.get({}).subscribe(async conceptosTurneables => {
            this.conceptosTurneables = conceptosTurneables;
            if (this.frecuentesTipoPrestacion.length > 0) {
                this.results.sugeridos['todos'] = [];
                this.frecuentesTipoPrestacion.forEach(element => {
                    if (this.results.sugeridos['todos'].indexOf(element) === -1) {
                        this.results.sugeridos['todos'].push(element);
                    }
                });
                // filtramos los resultados
                this.filtrarResultados('sugeridos');
                this.resultsAux.sugeridos = Object.assign({}, this.results.sugeridos);
                // seteamos el tipo de búsqueda actual como sugeridos
                this.busquedaActual = 'sugeridos';
            } else {
                this.busquedaActual = 'buscadorBasico';
            }

            let fp = await this.inicializarFrecuentesProfesional();
            if (fp && fp.length) {
                const frecuentesProfesional = fp.map((res: any) => {
                    let concepto = res.concepto;
                    (concepto as any).frecuencia = res.frecuencia;
                    (concepto as any).esSolicitud = res.esSolicitud;
                    return concepto;
                });

                this.results['misFrecuentes']['todos'] = frecuentesProfesional;
                this.filtrarResultados('misFrecuentes');
                this.resultsAux.misFrecuentes = Object.assign({}, this.results.misFrecuentes);
            } else {
                this.results['misFrecuentes']['todos'] = [];
            }

            let frecuentesTP = await this.inicializarFrecuentesTP();

            this.results['frecuentesTP']['todos'] = frecuentesTP.map(res => {
                let concepto = res.concepto;
                concepto.frecuencia = res.frecuencia;
                concepto.esSolicitud = res.esSolicitud;
                return concepto;
            });
            this.filtrarResultados('frecuentesTP');

            this.resultsAux.frecuentesTP = Object.assign({}, this.results.frecuentesTP);

            // inicializamos el filtro actual para los hallazgos
            this.filtroActual = 'todos';

            if (this.results['misFrecuentes']['todos'].length) {
                this.busquedaActual = 'misFrecuentes';
            } else if (this.results['sugeridos']['todos'].length) {
                this.busquedaActual = 'sugeridos';
            }
        });

    }

    private inicializarFrecuentesProfesional() {
        const queryFP = {
            'idProfesional': this.auth.profesional,
            'tipoPrestacion': this.conceptoFrecuente.conceptId,
            'idOrganizacion': this.auth.organizacion.id,
        };
        return this.frecuentesProfesionalService.get(queryFP).toPromise();
    }


    private inicializarFrecuentesTP() {
        let queryFTP = {
            'tipoPrestacion': this.prestacion.solicitud.tipoPrestacion.conceptId
        };
        return this.frecuentesProfesionalService.getXPrestacion(queryFTP).toPromise();
    }

    /**
     * Utilizamos el ngOnChanges para detectar cambios en los Inputs, en este caso
     * para agregar a los sugeridos nuevos conceptos para registrar en la consulta
     *
     * @param {SimpleChanges} changes
     * @memberof BuscadorComponent
     */
    ngOnChanges(changes: SimpleChanges) {
        // if (this.ultimoTipoBusqueda !== this.busquedaActual) {
        //     this.results.buscadorBasico = [];
        //     if (this.resultsAux && this.resultsAux.buscadorBasico) {
        //         this.resultsAux.buscadorBasico = [];
        //     }
        //     this.results[this.busquedaActual] = [];
        // }
        if (changes.frecuentesTipoPrestacion && changes.frecuentesTipoPrestacion.currentValue) {
            if (typeof this.results.sugeridos['todos'] === 'undefined') {
                this.results.sugeridos['todos'] = [];
            }
            changes.frecuentesTipoPrestacion.currentValue.forEach(element => {
                if (this.results.sugeridos['todos'].indexOf(element) === -1) {
                    if (this.conceptoFrecuente.term) {
                        element.sugeridoPor = this.conceptoFrecuente.term;
                    }
                    this.results.sugeridos['todos'].push(element);
                }
            });
        }
        let concepto: any = this.servicioPrestacion.getRefSetData();
        this.secciones = (concepto && concepto.conceptos && concepto.conceptos.term) ? concepto.conceptos.term : '';


        if (this.busquedaRefSet && this.busquedaRefSet.conceptos) {
            this.autofocus = false;
            this.setTipoBusqueda(this.busquedaActual);
            this.busquedaPorConcepto = true;
        } else {
            this.setTipoBusqueda(this.busquedaActual);
            this.busquedaPorConcepto = false;
        }



    }

    /**
     * Buscar resultados para los tipos de busqueda que sean sugeridos o mis frecuentes
     *
     * @memberof BuscadorComponent
     */
    public buscar() {
        // en caso que se cambie de tipo de busqueda y no existan resultados
        // en el filtro actual, seteamos el filtro en 'todos'
        if (this.results[this.busquedaActual][this.filtroActual] && this.results[this.busquedaActual][this.filtroActual].length === 0) {
            this.filtroActual = 'todos';
        }
        // reiniciamos los resultados desde la copia auxiliar que tenemos
        this.results = JSON.parse(JSON.stringify(this.resultsAux));
        if (this.results[this.busquedaActual][this.filtroActual] && this.results[this.busquedaActual][this.filtroActual].length > 0 && this.search) {

            let search = this.search.toLowerCase();
            let words = search.split(' ');
            // filtramos uno a uno los conceptos segun el string de busqueda
            // TODO:: buscar por cada palabra.. hacer una separacion de la busqueda por palabras
            Object.keys(this.conceptos).forEach(concepto => {
                words.forEach(word => {
                    if (this.results[this.busquedaActual][concepto]) {
                        this.results[this.busquedaActual][concepto] = this.results[this.busquedaActual][concepto].filter(registro => {
                            return registro.term.toLowerCase().indexOf(word) >= 0;
                        });
                    }


                });

            });

            // tambien filtramos el campo 'todos' segun el string de busqueda
            words = search.split(' ');
            words.forEach(word => {
                if (this.results[this.busquedaActual]['todos']) {
                    this.results[this.busquedaActual]['todos'] = this.results[this.busquedaActual]['todos'].filter(registro => {
                        return registro.term.toLowerCase().indexOf(word) >= 0;
                    });
                }
            });

        } else {
            // si el string de búsqueda esta vacío, reiniciamos los resultados desde la copia auxiliar
            // y seteamos en los filtros actuales
            // this.results[this.busquedaActual][concepto] = this.resultsAux[this.busquedaActual][this.filtroActual];
            this.results[this.busquedaActual] = this.resultsAux[this.busquedaActual];
        }

        // filtramos los resultados
        // this.filtrarResultados(this.busquedaActual);
    }

    /**
     * Setear la variable tipo de busqueda
     *
     * @param {any} busquedaActual String Tipo de busqueda que se va a realizar
     * @memberof BuscadorComponent
     */
    public setTipoBusqueda(busquedaActual): void {
        this.busquedaPorConcepto = false;
        if (this.busquedaActual !== busquedaActual) {
            this.busquedaActual = busquedaActual;
            // creamos una copia del filtro
            this.filtroActual = this.copiaFiltroActual ? this.copiaFiltroActual : this.filtroActual;

            if ((busquedaActual === 'sugeridos' || busquedaActual === 'misFrecuentes' || busquedaActual === 'frecuentesTP') && this.search) {
                this.buscar();
            } else {
                this.buscadorService.search(this.search);
            }
        }
        this.autofocus = true;
    }

    // drag and drop funciones. Hago los emit.

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);

        let filtro = this.getFiltroSeleccionado();

        // devolvemos los tipos de filtros
        this.tagBusqueda.emit(filtro);
    }

    /**
     * callback que se ejecuta cuando el buscador de SNOMED envia resultados
     *
     * @param {any} resultadosSnomed
     * @memberof BuscadorComponent
     */
    recibeResultados(resultadosSnomed: any) {
        this.busquedaRefSet = this.servicioPrestacion.getRefSetData();
        setTimeout(() => {
            if (this.busquedaRefSet && this.busquedaRefSet.conceptos) {
                this.autofocus = false;
                this.setTipoBusqueda(this.busquedaActual);
                this.busquedaPorConcepto = true;
            } else {
                this.setTipoBusqueda(this.busquedaActual);
                this.busquedaPorConcepto = false;
            }
        }, 100);

        // asignamos el termino de búsqueda para los buscadores de misFrecuentes y sugeridos
        this.search = resultadosSnomed.term;
        if (resultadosSnomed.items.length) {
            this.results.buscadorBasico['todos'] = resultadosSnomed.items;
            // this.results.buscadorBasico[this.filtroActual] = resultadosSnomed;

            // llamamos a la funcion que ordena mis frecuentes, poniendolo al prinicpio de los resultados
            this.getMisFrecuentes();

            // filtramos los resultados para el buscador basico en caso de movernos de opcion
            // evitando tener que volver a buscar
            // this.filtrarResultados(this.busquedaActual);
            this.filtrarResultados('buscadorBasico');

            // Filtra los resultado por referentSet

            // if (this.busquedaRefSet && this.busquedaRefSet.conceptos) {
            //     this.results.buscadorBasico['todos'] = this.results.buscadorBasico['todos'].filter(x => {
            //         return x.refsetIds.includes(this.busquedaRefSet.refsetId);
            //     });
            // }

            // asignamos a una variable auxiliar para luego restaurar los valores
            // en caso de buscar o filtrar
            this.resultsAux['buscadorBasico'] = this.results['buscadorBasico'];

        }

        // si limpio la busqueda, reinicio el buscador sugerido y misFrecuentes
        if (resultadosSnomed.items.length === 0) {
            this.results['sugeridos'] = this.resultsAux.sugeridos;
            this.results['misFrecuentes'] = this.resultsAux.misFrecuentes;
            this.results['frecuentesTP'] = this.resultsAux.frecuentesTP;

            this.results['buscadorBasico'] = [];
        }
    }

    public filtrarResultados(busquedaActual = 'busquedaActual') {
        // almacenamos los resultados en una variable auxiliar para poder loopear
        let resultados = this.results[busquedaActual]['todos'];

        if (this.conceptos && resultados) {
            Object.keys(this.conceptos).forEach(concepto => {
                this.results[busquedaActual][concepto] = resultados.filter(x => this.conceptos[concepto].find(y => y === x.semanticTag));


                // if (this.busquedaRefSet && this.busquedaRefSet.conceptos) {
                //     this.results[busquedaActual][concepto] = resultados.filter(x => this.conceptos[concepto].find(y => {
                //         return y === x.semanticTag && x.refsetIds.includes(this.busquedaRefSet.refsetId);
                //     }));
                // }
            });
        }

        if (this.results && this.results[busquedaActual]) {

            // quitamos de this.filtroActual aquellos que son turneables, no es correcto que aparezcan
            this.results[busquedaActual]['todos'] = this.results[busquedaActual]['todos'];
            // quitamos de los 'procedimientos' aquellos que son turneables, no es correcto que aparezcan
            this.results[busquedaActual]['procedimientos'] = this.results[busquedaActual]['procedimientos'] ? this.results[busquedaActual]['procedimientos'] : [];
            if (busquedaActual !== 'buscadorBasico') {
                // quitamos de los 'planes' aquellos que son no son solicitudes, no es correcto que aparezcan
                this.results[busquedaActual]['planes'] = this.results[busquedaActual]['planes'] ? this.results[busquedaActual]['planes'].filter(x => this.esSolicitud(x)) : [];
            }
            if (busquedaActual === 'misFrecuentes' || busquedaActual === 'frecuentesTP') {
                // quitamos aquellos que son no son elementos de registros, no es correcto que aparezcan
                this.results[busquedaActual]['todos'] = this.results[busquedaActual]['todos'] ? this.results[busquedaActual]['todos'].filter(x => !this.esElementoRegistro(x)) : [];
                this.results[busquedaActual]['procedimientos'] = this.results[busquedaActual]['procedimientos'] ? this.results[busquedaActual]['procedimientos'].filter(x => !this.esSolicitud(x)) : [];
                this.results[busquedaActual]['todos'] = this.results[busquedaActual]['todos'] ? this.results[busquedaActual]['todos'].filter(x => !this.esSolicitud(x)) : [];

            }
            if (this.results[busquedaActual]['planes']) {
                let planesCopia = JSON.parse(JSON.stringify(this.results[busquedaActual]['planes']));
                let planes = [];
                planesCopia.forEach(unPlan => {
                    unPlan.plan = true;
                    planes.push(unPlan);
                });
                // agregamos los planes
                this.results[busquedaActual]['todos'] = [...this.results[busquedaActual]['todos'], ...planes];
                // ordenamos los resultados
            }
        }
    }



    /**
     * Devuelve la cantidad de resultados según el tipo de búsqueda actual para cada uno de los filtros (semantic tag)
     *
     * @param {string} semanticTag
     * @returns Cantidad de resultados
     * @memberof BuscadorComponent
     */
    public getCantidadResultados(semanticTag) {
        if (this.results && this.busquedaActual && this.results[this.busquedaActual] && this.results[this.busquedaActual][semanticTag]) {

            // if (this.busquedaRefSet && this.busquedaRefSet.conceptos && this.results.buscadorBasico[this.filtroActual]) {
            //     this.results.buscadorBasico[this.filtroActual] = this.results.buscadorBasico[this.filtroActual].filter(x => {
            //         return x.refsetIds.includes(this.busquedaRefSet.refsetId);
            //     });
            // }

            return this.results[this.busquedaActual][semanticTag].length;
        }
        return 0;
    }


    public getMisFrecuentes() {
        let frecuentes = [];
        // Esperamos que haya un resultado de más frecuentes antes de mostrar los
        // resultados completos
        if (this.results.misFrecuentes && this.results.misFrecuentes['todos'] && this.results.misFrecuentes['todos'].length) {
            // Si hay un concepto frecuente en la lista de resultados, se lo mueve al tope
            // de la lista con Array.unshift()
            // Finalmente se orde  nan los más frecuentes de mayor a menor frecuencia
            this.results.misFrecuentes['todos'].sort((a, b) => b.frecuencia - a.frecuencia);
            frecuentes = this.results.misFrecuentes['todos'].map(x => {
                if (x.frecuencia != null && x.frecuencia >= 1 && this.results.buscadorBasico['todos'].find(c => c.conceptId === x.conceptId)) {
                    let index = this.results.buscadorBasico['todos'].findIndex(r => r.conceptId === x.conceptId);
                    let registroFrec = this.results.buscadorBasico['todos'][index];
                    this.results.buscadorBasico['todos'].splice(index, 1);
                    this.results.buscadorBasico['todos'].unshift(registroFrec);
                }
                return x;
            });


            // Se le asignan los resultados ordenados con los mas frecuentes.
            // this.results.buscadorBasico = this.resultsAux = this.results.buscadorBasico;
        }
        this.tengoResultado.emit(true);
    }

    /**
     * Setea filtro por semantic tags
     */

    public filtroBuscadorSnomed(key) {

        this.filtroActual = key;
    }

    /**
     * Si hago clic en un concepto (+), entonces hago el EventEmitter hacia otro componente
     *
     * @param {any} concepto Concepto SNOMED
     * @memberof BuscadorComponent
     */
    public seleccionarConcepto(concepto, index) {
        gtag('add-concept', this.busquedaActual, this.search, index);
        let filtro;

        if (concepto.plan) {
            filtro = ['planes'];
        } else {
            filtro = this.getFiltroSeleccionado();
        }

        if (!this.secciones) {
            this.evtData.emit([filtro, concepto]);
        } else {
            this.servicioPrestacion.setData(concepto);
        }
    }

    getFiltroSeleccionado() {
        this.servicioPrestacion.setEsSolicitud(false);
        // let filtro = this.esTurneable(concepto) ? ['planes'] : this.filtroActual;
        let filtro = (this.conceptos[this.filtroActual]) ? this.conceptos[this.filtroActual] : null;
        // si estamos en buscador basico nos fijamos si el filtro seleccionado es planes
        // o bien, si estamos en el buscador guiado, si la opcion desplegada es planes
        // entonces sobreescribmos el filtro a emitir como ['planes']
        if (this.filtroActual === 'planes' || this.opcionDesplegada === 'planes') {
            filtro = ['planes'];
            // Seteamos si el filtro es solicitud.
            this.servicioPrestacion.setEsSolicitud(true);
        }
        return filtro;
    }

    public esSolicitud(concepto: any) {
        return concepto.esSolicitud;
    }

    public esElementoRegistro(concepto: any) {
        return concepto.semanticTag === 'elemento de registro';
    }

    /**
     * Devuelve los posibles semantic tags que busca según el tipo de filtro seleccionado.
     * @returns string Semanti Tags posibles
     * @memberof BuscadorComponent
     */
    public getSemanticTagFiltros() {
        if (!this.busquedaPorConcepto) {
            return this.conceptos[this.filtroActual];
        }
        return this.busquedaPorConcepto;
    }

}
