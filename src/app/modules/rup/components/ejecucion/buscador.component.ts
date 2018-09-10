import { SemanticTag } from './../../interfaces/semantic-tag.type';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { PrestacionesService } from '../../services/prestaciones.service';
import { FrecuentesProfesionalService } from '../../services/frecuentesProfesional.service';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { ElementosRUPService } from '../../services/elementosRUP.service';

@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']
})

export class BuscadorComponent implements OnInit, OnChanges {
    autofocus: any;

    // @Input() elementoRUPprestacion;
    // @Input() resultados;
    @Input() _draggable: Boolean = false; // TODO Ver si lo sacamos.
    // Son los mas frecuentes del elemento rup.(tipo de prestación)
    @Input() frecuentesTipoPrestacion;
    @Input() showFrecuentesTipoPrestacion;
    @Input() conceptoFrecuente;
    @Input() prestacion: IPrestacion;
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
    // Lista de planes.
    public listaPlanes: any[] = [];
    // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    // Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    // public tipoBusqueda = ''; // Por defecto trae TODO

    public loading = false;


    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    public elementRef;
    public arrayPorRefsets = [];
    public showRefSets = false;
    // boolean que se utiliza para expandir o contraer los contenidos de la busqueda guiada
    public desplegarConceptos;

    // Arra de salida para los mas frecuentes del profesional
    public arrayFrecuentes: any[] = [];
    // Boolean para mostrar lo mas fecuentes
    public showFrecuentes = false;


    // TODO Ver si lo dejamos asi
    public _dragScope = ['registros-rup', 'vincular-registros-rup'];

    public conceptosTurneables: any[];

    public conceptos = {
        hallazgos: ['hallazgo', 'situación'],
        trastornos: ['trastorno'],
        procedimientos: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        planes: ['procedimiento', 'régimen/tratamiento'],
        productos: ['producto'],
        otros: ['elemento de registro']

    };

    // Listados de grupos de la busqueda guiada
    public grupos_guida: any[] = [];

    // posibles valores para el filtro actual: 'hallazgos', 'trastornos', 'procedimientos', 'planes', 'productos'
    public filtroActual: any;

    // posibles valores para la búsqueda actual: 'todos', 'misFrecuentes', 'sugeridos', 'busquedaGuiada', 'buscadorBasico'
    public busquedaActual: any;

    // objeto de resultados
    public results = { 'misFrecuentes': [], 'sugeridos': [], 'busquedaGuiada': [], 'buscadorBasico': [] };
    public resultsAux: any;

    // public totalesTodos: Number = 0;

    public copiaFiltroActual: any;

    private opcionDesplegada: String = null;

    public search; // buscador de sugeridos y mis frecuentes

    constructor(public servicioTipoPrestacion: TipoPrestacionService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth, private elementoRUP: ElementosRUPService,
        public servicioPrestacion: PrestacionesService) {
    }

    ngOnInit() {
        // inicializamos variable resultsAux con la misma estructura que results
        this.resultsAux = Object.assign({}, this.results);
        // Se traen los Conceptos Turneables para poder quitarlos de la lista de
        // Procedimientos
        this.elementoRUP.guiada(this.prestacion.solicitud.tipoPrestacion.conceptId).subscribe((grupos) => {
            this.grupos_guida = grupos;
            this.filtrarResultadosBusquedaGuiada();
        });

        this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
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

            const query = {
                'idProfesional': this.auth.profesional.id,
                'tipoPrestacion': this.conceptoFrecuente.conceptId,
                'idOrganizacion': this.auth.organizacion.id,
            };

            this.frecuentesProfesionalService.get(query).subscribe((resultados: any) => {
                // const frecuentesProfesional = resultados[0].frecuentes.map(res => res.concepto);
                if (resultados && resultados.length) {
                    const frecuentesProfesional = resultados[0].frecuentes.map(res => {
                        let concepto = res.concepto;
                        concepto.frecuencia = res.frecuencia;
                        return concepto;
                    });
                    this.results['misFrecuentes']['todos'] = frecuentesProfesional;
                    this.filtrarResultados('misFrecuentes');
                    this.resultsAux.misFrecuentes = Object.assign({}, this.results.misFrecuentes);
                }
            });
            // inicializamos el filtro actual para los hallazgos
            this.filtroActual = 'todos';
        });
    }

    /**
     * Utilizamos el ngOnChanges para detectar cambios en los Inputs, en este caso
     * para agregar a los sugeridos nuevos conceptos para registrar en la consulta
     *
     * @param {SimpleChanges} changes
     * @memberof BuscadorComponent
     */
    ngOnChanges(changes: SimpleChanges) {
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
            // filtramos uno a uno los conceptos segun el string de busqueda
            Object.keys(this.conceptos).forEach(concepto => {
                this.results[this.busquedaActual][concepto] = this.results[this.busquedaActual][concepto].filter(registro => {
                    return registro.term.toLowerCase().indexOf(search) >= 0;
                });
            });

            // tambien filtramos el campo 'todos' segun el string de busquueda
            this.results[this.busquedaActual]['todos'] = this.results[this.busquedaActual]['todos'].filter(registro => {
                return registro.term.toLowerCase().indexOf(search) >= 0;
            });
        } else {
            // si el string de busqueda esta vacio, reiniciamos los resultados desde la copia auxiliar
            // y seteamos en los filtros actuales
            // this.results[this.busquedaActual][this.filtroActual] = this.resultsAux[this.busquedaActual][this.filtroActual];
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
    public setTipoBusqueda(busquedaActual: any): void {
        if (this.busquedaActual !== busquedaActual) {
            this.busquedaActual = busquedaActual;
            // creamos una copia del filtro
            /**
             * Si vamos a la busqueda guiada seteamos el filtro en todos, en caso contrario
             * lo dejamos como estaba al principio
             */
            if (busquedaActual === 'busquedaGuiada') {
                this.copiaFiltroActual = this.filtroActual;
                this.filtroActual = 'todos';
            } else {
                this.filtroActual = this.copiaFiltroActual ? this.copiaFiltroActual : this.filtroActual;
            }
            if ((busquedaActual === 'sugeridos' || busquedaActual === 'misFrecuentes') && this.search) {
                this.buscar();
            }
        }
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
        // asignamos el termino de búsqueda para los buscadores de misFrecuentes y sugeridos
        this.search = resultadosSnomed.term;
        if (resultadosSnomed.items.length) {

            this.results.buscadorBasico['todos'] = resultadosSnomed.items;
            this.results.busquedaGuiada['todos'] = resultadosSnomed.items;
            // this.results.buscadorBasico['todos'] = resultadosSnomed;

            // llamamos a la funcion que ordena mis frecuentes, poniendolo al prinicpio de los resultados
            this.getMisFrecuentes();

            // filtramos los resultados para el buscador basico en caso de movernos de opcion
            // evitando tener que volver a buscar
            // this.filtrarResultados(this.busquedaActual);
            this.filtrarResultados('buscadorBasico');

            // filtramos los resultados para la busqueda guiada y que quede armado
            // con el formato para los desplegables
            this.filtrarResultadosBusquedaGuiada();
            // Hay más frecuentes? Frecuentes de este profesional

            // asignamos a una variable auxiliar para luego restaurar los valores
            // en caso de buscar o filtrar
            this.resultsAux['buscadorBasico'] = this.results['buscadorBasico'];
            this.resultsAux['busquedaGuiada'] = this.results['busquedaGuiada'];
        }

        // si limpio la busqueda, reinicio el buscador sugerido y misFrecuentes
        if (resultadosSnomed.items.length === 0) {
            this.results['sugerido'] = this.resultsAux.sugerido;
            this.results['misFrecuentes'] = this.resultsAux.misFrecuentes;
            this.results['buscadorBasico'] = [];
            // Llamamos a la funcion de la busqueda guiada para que limpie los campos.
            this.filtrarResultadosBusquedaGuiada();
        }

    }

    public filtrarResultados(busquedaActual) {
        // almacenamos los resultados en una variable auxiliar para poder loopear
        let resultados = this.results[busquedaActual]['todos'];

        Object.keys(this.conceptos).forEach(concepto => {
            this.results[busquedaActual][concepto] = resultados.filter(x => this.conceptos[concepto].find(y => y === x.semanticTag));
        });

        // quitamos de los 'procedimientos' aquellos que son turneables, no es correcto que aparezcan
        this.results[busquedaActual]['procedimientos'] = this.results[busquedaActual]['procedimientos'].filter(x => !this.esTurneable(x));
        // quitamos de 'todos' aquellos que son turneables, no es correcto que aparezcan
        this.results[busquedaActual]['todos'] = this.results[busquedaActual]['todos'].filter(x => !this.esTurneable(x));
        if (this.results[busquedaActual]['planes'].length) {
            let planesCopia = JSON.parse(JSON.stringify(this.results[busquedaActual]['planes']));
            let planes = [];
            planesCopia.forEach(unPlan => {
                unPlan.plan = true;
                planes.push(unPlan);
            });
            // agregamos los planes
            this.results[busquedaActual]['todos'] = [...resultados, ...planes];
        }
    }

    public filtrarResultadosBusquedaGuiada() {
        this.results.busquedaGuiada = [];

        this.grupos_guida.forEach(data => {
            if (this.results.buscadorBasico['todos']) {
                this.results.busquedaGuiada.push({
                    nombre: data.nombre,
                    valor: this.results.buscadorBasico['todos'].filter(x => data.conceptIds.indexOf(x.conceptId) >= 0)
                });
            } else {
                this.results.busquedaGuiada.push({
                    nombre: data.nombre,
                    valor: []
                });
            }
        });

        Object.keys(this.conceptos).forEach(concepto => {
            if (this.results.buscadorBasico['todos']) {
                this.results.busquedaGuiada.push({
                    nombre: concepto,
                    valor: this.results.buscadorBasico[concepto].filter(x => this.conceptos[concepto].find(y => y === x.semanticTag))
                });
            } else {
                this.results.busquedaGuiada.push({
                    nombre: concepto,
                    valor: []
                });
            }
        });
    }


    /**
     * Devuelve la cantidad de resultados según el tipo de búsqueda actual para cada uno de los filtros (semantic tag)
     *
     * @param {string} semanticTag
     * @returns Cantidad de resultados
     * @memberof BuscadorComponent
     */
    public getCantidadResultados(semanticTag: string) {
        if (this.results && this.busquedaActual
            && this.results[this.busquedaActual] && this.results[this.busquedaActual][semanticTag]) {
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
            frecuentes = this.results.misFrecuentes['todos'].map(x => {
                if (x.frecuencia != null && x.frecuencia >= 1 && this.results.buscadorBasico['todos'].find(c => c.conceptId === x.conceptId)) {
                    this.results.buscadorBasico['todos'].splice(this.results.buscadorBasico['todos'].findIndex(r => r.conceptId === x.conceptId), 1);
                    this.results.buscadorBasico['todos'].unshift(x);
                }
                return x;
            });
            // Finalmente se orde  nan los más frecuentes de mayor a menor frecuencia
            frecuentes.sort((a, b) => b.frecuencia - a.frecuencia);
            // Se le asignan los resultados ordenados con los mas frecuentes.
            // this.results.buscadorBasico = this.resultsAux = this.results.buscadorBasico;
        }
        this.tengoResultado.emit(true);
    }

    /**
     *
     * @param  $event Recibe un boolean de la busqueda de snomed
     * Indica cuando se esta buscando y cuando ya termino la busqueda para mostrar
     * el plex-loader.
     */
    public Loader($event) {
        this.loading = $event;
    }

    /**
     *
     * @param filtro Le pasamos el o los semanticTags a filtrar
     * @param tipo le pasamos el tipo de busqueda por ejemplo Plan.
     * @param arrayAFiltrar Le podemos pasar un array de conceptos a filtrar
     * Por defecto la funcion trabaja con el array de resultados pero si le pasamos un array
     * disitinte de conceptos nos retorna el resultado.
     */

    // filtroBuscadorSnomed(filtro: any[], tipo = null) {
    public filtroBuscadorSnomed(key) {
        this.filtroActual = key;
        // this.filtrarResultados(this.busquedaActual);
    }

    /**
     * Si hago clic en un concepto (+), entonces hago el EventEmitter hacia otro componente
     *
     * @param {any} concepto Concepto SNOMED
     * @memberof BuscadorComponent
     */
    public seleccionarConcepto(concepto: any) {
        let copiaConcepto = JSON.parse(JSON.stringify(concepto));
        let filtro;
        if (copiaConcepto.plan) {
            delete copiaConcepto.plan;
            filtro = ['planes'];
        } else {
            filtro = this.esTurneable(concepto) ? ['planes'] : this.getFiltroSeleccionado();
        }
        // devolvemos los tipos de filtros
        this.tagBusqueda.emit(filtro);
        // devolvemos el concepto SNOMED
        this.evtData.emit(copiaConcepto);
    }

    getFiltroSeleccionado() {
        // let filtro = this.esTurneable(concepto) ? ['planes'] : this.filtroActual;
        let filtro = (this.conceptos[this.filtroActual]) ? this.conceptos[this.filtroActual] : null;
        // si estamos en buscador basico nos fijamos si el filtro seleccionado es planes
        // o bien, si estamos en el buscador guiado, si la opcion desplegada es planes
        // entonces sobreescribmos el filtro a emitir como ['planes']
        if (this.filtroActual === 'planes' || this.opcionDesplegada === 'planes') {
            filtro = ['planes'];
        }
        return filtro;
    }

    /**
     *
     * @param nombre Se le pasa el nombre del objeto de la posicion i
     * La funcion despliega los desplegables de la busqueda guiada.
     * Al abrir uno automaticamente cierra el que anteriormente se abrio.
     */
    public desplegar(nombre) {
        // this.opcionDesplegada = nombre;
        this.opcionDesplegada = (this.opcionDesplegada === nombre) ? null : nombre;
    }

    /**
     * Devuelve si un concepto es turneable o no.
     * Se fija en la variable conceptosTurneables inicializada en OnInit
     *
     * @param {any} concepto Concepto SNOMED a verificar si esta en el array de conceptosTurneables
     * @returns  boolean TRUE/FALSE si es turneable o no
     * @memberof BuscadorComponent
     */
    public esTurneable(concepto: any) {
        if (!this.conceptosTurneables) {
            return false;
        }
        return this.conceptosTurneables.find(x => {
            return x.conceptId === concepto.conceptId;
        });
    }

    /**
     * Devuelve los posibles semantic tags que busca según el tipo de filtro seleccionado.
     * @returns string Semanti Tags posibles
     * @memberof BuscadorComponent
     */
    public getSemanticTagFiltros() {
        return this.conceptos[this.filtroActual];
    }

}
