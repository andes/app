import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnomedBuscarService } from '../../../../components/snomed/snomed-buscar.service';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { ITipoPrestacion } from '../../../../interfaces/ITipoPrestacion';
import { gtag } from '../../../../shared/services/analytics.service';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';
import { RupEjecucionService } from '../../services/ejecucion.service';
import { FrecuentesProfesionalService } from '../../services/frecuentesProfesional.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ISnomedSearchResult } from './../../interfaces/snomedSearchResult.interface';
import { ProfesionalService } from 'src/app/services/profesional.service';


@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']
})

export class BuscadorComponent implements OnInit, OnChanges {
    @Input() conceptoFrecuente;
    @Input() prestacion: IPrestacion;
    @Input() tipoPrestacion: ITipoPrestacion;
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    @Input() semanticTags: string[] = null;

    // TODO Ver si lo dejamos asi
    public _dragScope = ['registros-rup', 'vincular-registros-rup'];

    public conceptos = {
        hallazgos: ['hallazgo', 'situación', 'evento'],
        trastornos: ['trastorno'],
        procedimientos: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        planes: ['procedimiento', 'régimen/tratamiento'],
        productos: ['producto', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico'],
        otros: ['elemento de registro']
    };

    public filtroActual: 'hallazgos' | 'trastornos' | 'procedimientos' | 'planes' | 'productos' | 'todos' = 'todos';
    public busquedaActual: 'misFrecuentes' | 'sugeridos' | 'buscadorBasico' | 'frecuentesTP' = 'misFrecuentes';

    // objeto de resultados
    public results: ISnomedSearchResult = {
        todos: [],
        misFrecuentes: [],
        sugeridos: [],
        buscadorBasico: [],
        frecuentesTP: []
    };
    public resultsAux: any;
    public resultadosSnomedAux;
    public copiaFiltroActual: any;


    public search; // buscador de sugeridos y mis frecuentes

    seccion$ = this.ejecucionService.getSeccion();
    ondontogramaDientes$ = this.servicioPrestacion.getRefSet().pipe(
        map(datos => datos && datos.conceptos)
    );

    constructor(
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService,
        private buscadorService: SnomedBuscarService,
        public renderer: Renderer2,
        private ejecucionService: RupEjecucionService,
        private plex: Plex,
        public profesionalService: ProfesionalService
    ) {
    }


    async ngOnInit() {
        this.resultsAux = { ...this.results };
        this.inicializarBuscadorBasico();
        this.results.sugeridos['todos'] = [];

        this.ejecucionService.getSugeridos().subscribe(conceptos => {
            conceptos.forEach(element => {
                if (this.results.sugeridos['todos'].indexOf(element) === -1) {
                    this.results.sugeridos['todos'] = [
                        ...this.results.sugeridos['todos'],
                        element
                    ];
                }
            });
            this.filtrarResultados('sugeridos');
            this.resultsAux.sugeridos = Object.assign({}, this.results.sugeridos);
        });
    }

    inicializarBuscadorBasico() {
        forkJoin(
            this.inicializarFrecuentesProfesional(),
            this.inicializarFrecuentesTP()
        ).subscribe(([fp, frecuentesTP]) => {
            if (fp && fp.length) {
                const frecuentesProfesional = fp.map(res => {
                    const concepto: any = res.concepto;
                    concepto.frecuencia = res.frecuencia;
                    concepto.esSolicitud = res.esSolicitud;
                    return concepto;
                });

                this.results['misFrecuentes']['todos'] = frecuentesProfesional;
                this.filtrarResultados('misFrecuentes');
                this.resultsAux.misFrecuentes = Object.assign({}, this.results.misFrecuentes);
            } else {
                this.results['misFrecuentes']['todos'] = [];
            }


            this.results['frecuentesTP']['todos'] = frecuentesTP.map((res) => {
                const concepto: any = res.concepto;
                concepto.frecuencia = res.frecuencia;
                concepto.esSolicitud = res.esSolicitud;
                return concepto;
            });
            this.filtrarResultados('frecuentesTP');

            this.resultsAux.frecuentesTP = Object.assign({}, this.results.frecuentesTP);

            if (this.results['misFrecuentes']['todos'] && this.results['misFrecuentes']['todos'].length) {
                this.busquedaActual = 'misFrecuentes';
            } else if (this.results['sugeridos']['todos'] && this.results['sugeridos']['todos'].length) {
                this.busquedaActual = 'sugeridos';
            } else {
                this.busquedaActual = 'buscadorBasico';
            }

            // inicializamos el filtro actual para los hallazgos
            this.filtroActual = 'todos';
            this.buscar();
        });

    }

    private inicializarFrecuentesProfesional() {
        const queryFP = {
            'idProfesional': this.auth.profesional,
            'tipoPrestacion': this.conceptoFrecuente.conceptId,
            'idOrganizacion': this.auth.organizacion.id,
        };
        return this.frecuentesProfesionalService.get(queryFP);
    }


    private inicializarFrecuentesTP() {
        const queryFTP = {
            'tipoPrestacion': this.tipoPrestacion.conceptId
        };
        return this.frecuentesProfesionalService.get(queryFTP);
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


    private buscarTerm(word, registro) {
        const actualTerm = registro.term.toLowerCase();
        let matchTerm = actualTerm.indexOf(word) >= 0;
        if (matchTerm && (this.busquedaActual === 'misFrecuentes' || this.busquedaActual === 'frecuentesTP')) {
            matchTerm = !(registro.conceptId === this.prestacion.solicitud.tipoPrestacion.conceptId);
        }
        return matchTerm;
    }

    private filtrarTermPrestacion() {
        let resultados = this.resultsAux[this.busquedaActual][this.filtroActual];
        if (this.busquedaActual === 'misFrecuentes' || this.busquedaActual === 'frecuentesTP') {
            resultados = resultados.filter(registro => !(registro.conceptId === this.prestacion.solicitud.tipoPrestacion.conceptId));
        }
        this.results[this.busquedaActual][this.filtroActual] = resultados;
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

            const search = this.search.toLowerCase();
            let words = search.split(' ');
            // filtramos uno a uno los conceptos segun el string de busqueda
            Object.keys(this.conceptos).forEach(concepto => {
                words.forEach(word => {
                    if (this.results[this.busquedaActual][concepto]) {
                        this.results[this.busquedaActual][concepto] = this.results[this.busquedaActual][concepto].filter(registro => {
                            return this.buscarTerm(word, registro);
                        });
                    }
                });
            });

            // tambien filtramos el campo 'todos' segun el string de busqueda
            words = search.split(' ');
            words.forEach(word => {
                if (this.results[this.busquedaActual]['todos']) {
                    this.results[this.busquedaActual]['todos'] = this.results[this.busquedaActual]['todos'].filter(registro => {
                        return this.buscarTerm(word, registro);
                    });
                }
            });

        } else {
            this.filtroActual = 'todos';
            this.filtrarTermPrestacion();
        }
    }

    /**
     * Setear la variable tipo de busqueda
     *
     * @param {any} busquedaActual String Tipo de busqueda que se va a realizar
     * @memberof BuscadorComponent
     */
    public setTipoBusqueda(busquedaActual): void {
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
    }

    // drag and drop funciones. Hago los emit.

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }

    /**
     * callback que se ejecuta cuando el buscador de SNOMED envia resultados
     *
     * @param {any} resultadosSnomed
     */
    recibeResultados(resultadosSnomed: any) {
        // asignamos el termino de búsqueda para los buscadores de misFrecuentes y sugeridos
        this.search = resultadosSnomed.term;
        this.resultadosSnomedAux = resultadosSnomed.items;
        if (resultadosSnomed.items.length) {

            resultadosSnomed.items = resultadosSnomed.items.filter(i => i.conceptId !== this.tipoPrestacion.conceptId);

            this.results.buscadorBasico['todos'] = resultadosSnomed.items;


            // llamamos a la funcion que ordena mis frecuentes, poniendolo al prinicpio de los resultados
            this.getMisFrecuentes();
            this.filtrarResultados('buscadorBasico');

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
        if (!this.search) {
            this.filtroActual = 'todos';
        }
    }

    public filtrarResultados(busquedaActual = 'busquedaActual') {
        // almacenamos los resultados en una variable auxiliar para poder loopear
        const resultados = this.results[busquedaActual]['todos'];

        if (this.conceptos && resultados) {
            Object.keys(this.conceptos)
                .filter(semantic => !this.semanticTags || this.semanticTags.includes(semantic))
                .forEach(concepto => {
                    if (concepto === 'planes' && this.resultadosSnomedAux) {
                        this.results[busquedaActual][concepto] = this.resultadosSnomedAux.filter(x => this.conceptos[concepto].find(y => y === x.semanticTag));
                    } else {
                        this.results[busquedaActual][concepto] = resultados.filter(x => this.conceptos[concepto].find(y => y === x.semanticTag));
                    }
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
                const planesCopia = JSON.parse(JSON.stringify(this.results[busquedaActual]['planes']));
                const planes = [];
                planesCopia.forEach(unPlan => {
                    unPlan.esSolicitud = true;
                    planes.push(unPlan);
                });
                // agregamos los planes
                this.results[busquedaActual]['todos'] = [...this.results[busquedaActual]['todos'], ...planes];
                // ordenamos los resultados
            }

            if (this.semanticTags) {
                this.results[busquedaActual]['todos'] = [];
                this.filtroActual = this.semanticTags[0] as any;
            }
        }
    }



    /**
     * Devuelve la cantidad de resultados según el tipo de búsqueda actual para cada uno de los filtros (semantic tag)
     *
     * @param {string} semanticTag
     * @returns Cantidad de resultados
     */
    public getCantidadResultados(semanticTag) {
        if (this.results && this.busquedaActual && this.results[this.busquedaActual] && this.results[this.busquedaActual][semanticTag]) {
            return this.results[this.busquedaActual][semanticTag].length;
        }
        return 0;
    }


    public getMisFrecuentes() {
        if (this.results.misFrecuentes && this.results.misFrecuentes['todos'] && this.results.misFrecuentes['todos'].length) {
            // Si hay un concepto frecuente en la lista de resultados, se lo mueve al tope
            // de la lista con Array.unshift()
            // Finalmente se orde  nan los más frecuentes de mayor a menor frecuencia
            this.results.misFrecuentes['todos'].sort((a, b) => b.frecuencia - a.frecuencia);
            this.results.misFrecuentes['todos'].map(x => {
                if (x.frecuencia != null && x.frecuencia >= 1 && this.results.buscadorBasico['todos'].find(c => c.conceptId === x.conceptId)) {
                    const index = this.results.buscadorBasico['todos'].findIndex(r => r.conceptId === x.conceptId);
                    const registroFrec = this.results.buscadorBasico['todos'][index];
                    registroFrec.frecuencia = x.frecuencia;
                    this.results.buscadorBasico['todos'].splice(index, 1);
                    this.results.buscadorBasico['todos'].unshift(registroFrec);
                }
                return x;
            });
        }
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
     */
    public verificarProfesional(concepto, index) {
        let permiso = false;
        if (concepto.conceptId === '33633005' && !concepto.esSolicitud) {// receta y !solicitud
            if (this.auth.profesional) {
                this.profesionalService.getByID(this.auth.profesional).subscribe(profesional => {
                    if (profesional) {
                        const codigosPermitidos = [1, 2, 23]; // [medico, odontologo, obstetra]
                        let motivoRechazo = null;
                        permiso = (profesional?.formacionGrado?.find(item => {
                            const profesionHabilitada = codigosPermitidos.includes(item.profesion?.codigo);
                            const estadoMatricula = this.verificarEstadoMatricula(item);
                            if (profesionHabilitada) {
                                motivoRechazo = estadoMatricula.value;
                            }
                            return profesionHabilitada && estadoMatricula.key;
                        })) !== undefined;
                        if (permiso) {
                            this.seleccionarConcepto(concepto, index);
                        } else {
                            this.plex.info('warning', motivoRechazo ? `Su matrícula se encuentra ${motivoRechazo} para emitir una Receta` : 'Sin profesión habilitada para emitir una Receta');
                        }
                    }
                });
            }
        } else {
            this.seleccionarConcepto(concepto, index);
        }
    }

    verificarEstadoMatricula(formacionGrado) {
        const estado = {
            value: 'vigente',
            key: false
        };
        if (formacionGrado.matriculacion) {
            if (!formacionGrado.matriculado && new Date < formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
                estado.value = 'suspendida';
            } else {
                if (new Date > formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
                    estado.value = 'vencida';
                } else {
                    estado.key = true;
                }
            }
        } else {
            estado.value = 'inhabilitada';
        }
        return estado;
    }

    public seleccionarConcepto(concepto, index) {
        gtag('add-concept', this.busquedaActual, this.search, index);
        concepto.esSolicitud = concepto.esSolicitud || this.filtroActual === 'planes';
        if (this.ejecucionService.paciente && concepto.esSolicitud) {
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
                if (resultado.length) {
                    this.plex.confirm(`El paciente ya tiene una solicitud en curso para ${concepto.term}. ¿Desea continuar?`, 'Paciente con solicitud en curso').then(confirmar => {
                        if (confirmar) {
                            this.agregarConcepto(concepto);
                        }
                    });
                    this.plex.toast('danger', `El paciente ya tiene una solicitud en curso para ${concepto.term}`);
                } else {
                    this.agregarConcepto(concepto);
                }
            });
        } else {
            this.agregarConcepto(concepto);
        }
    }

    private agregarConcepto(concepto) {
        this.selected.emit(concepto);
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
        return this.conceptos[this.filtroActual];
    }

    descendienteSearch: ISnomedConcept;
    previousText = null;

    filtrarPorDescendientes(item: ISnomedConcept) {
        this.previousText = this.search;
        this.descendienteSearch = item;
        this.busquedaActual = 'buscadorBasico';
        this.buscadorService.search({ term: '', expression: `<<${item.conceptId}` });
    }

    removeDescendiente() {
        this.search = this.previousText || '';
        this.descendienteSearch = null;
        this.buscadorService.search(this.search);
    }

}
