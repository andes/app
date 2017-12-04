import { element } from 'protractor';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { PrestacionesService } from '../../services/prestaciones.service';
import { FrecuentesProfesionalService } from '../../services/frecuentesProfesional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']
})

export class BuscadorComponent implements OnInit {
    @Input() elementoRUPprestacion;
    @Input() resultados;
    @Input() _draggable: Boolean = false; // TODO Ver si lo sacamos.
    // Son los mas frecuentes del elemento rup.(tipo de prestación)
    @Input() frecuentesTipoPrestacion;
    /**
     * Devuelve un elemento seleccionado.
     */

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();
    // emito el tipo de busqueda para que lo reciba el buscador SNOMED.

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
    public tipoBusqueda = ''; // Por defecto trae TODO
    // public showPlanes = false;
    public ejecucion: any[] = [];

    // // array de los mas frecuentes..
    // public masFrecuentes: any[] = [];
    // // Array de las mas frecuentes filtradas por semantictag de snomed
    // public masFrecuentesFiltradas: any[] = [];

    public loading = false;
    public filtroActual = [];
    public esFiltroActual = false;

    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    public resultadosAux: any[] = [];
    public elementRef;
    public arrayPorRefsets = [];
    public showRefSets = false;

    public showContent;

    // Arra de salida para los mas frecuentes del profesional
    public arrayFrecuentes: any[] = [];
    // Boolean para mostrar lo mas fecuentes
    public showFrecuentes = false;
    // Guardo una copia completa de los mas frecuentes;
    public resultadosFrecuentesAux: any[] = [];

    // TODO Ver si lo dejamos asi
    public _dragScope = ['registros-rup', 'vincular-registros-rup'];

    public conceptosTurneables: any[];

    public contadorSemanticTags = {
        hallazgo: 0,
        trastorno: 0,
        procedimiento: 0,
        entidadObservable: 0,
        situacion: 0,
        producto: 0,
        regimenTratamiento: 0
    };

    constructor(public servicioTipoPrestacion: TipoPrestacionService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService) {

    }

    ngOnInit() {
        // Se traen los Conceptos Turneables para poder quitarlos de la lista de
        // Procedimientos
        this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
            this.conceptosTurneables = conceptosTurneables;
        });
    }

    // drag and drop funciones. Hago los emit.

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }

    recibeResultados(resultadosSnomed) {
        // Limpio los resultados (también se limpian los contadores)
        this.resultados = this.resultadosAux = [];
        // Hay más frecuentes? Frecuentes de este profesional
        this.frecuentesProfesionalService.getById(this.auth.profesional.id).subscribe(resultado => {
            let frecuentes = [];
            // Esperamos que haya un resultado de más frecuentes antes de mostrar los
            // resultados completos
            this.contarSemanticTags(resultadosSnomed);
            if (resultado && resultado[0] && resultado[0].frecuentes) {
                // Si hay un concepto frecuente en la lista de resultados, se lo mueve al tope
                // de la lista con Array.unshift()
                frecuentes = resultado[0].frecuentes.map(x => {
                    if (x.frecuencia != null && x.frecuencia >= 1 && resultadosSnomed.find(c => c.conceptId === x.concepto.conceptId)) {
                        resultadosSnomed.splice(resultadosSnomed.findIndex(r => r.conceptId === x.concepto.conceptId), 1);
                        resultadosSnomed.unshift(x.concepto);
                    }
                    return x;
                });
                // Finalmente se orde  nan los más frecuentes de mayor a menor frecuencia
                frecuentes.sort((a, b) => b.frecuencia - a.frecuencia);
                // Se le asignan los resultados ordenados con los mas frecuentes.
                this.resultados = this.resultadosAux = resultadosSnomed;
                this.arrayFrecuentes = frecuentes;
                this.resultadosFrecuentesAux = this.arrayFrecuentes;
                this.arrayFrecuentes = this.arrayFrecuentes.map(x => x.concepto);

            } else {
                this.resultados = this.resultadosAux = resultadosSnomed;
            }
            this.filtroRefSet();
        });
    }

    /**
     *
     * @param  $event Recibe un boolean de la busqueda de snomed
     * Indica cuando se esta buscando y cuando ya termino la busqueda para mostrar
     * el plex-loader.
     */
    Loader($event) {
        this.loading = $event;
    }

    /**
     *
     * @param resultados Recibe el array de los resultados
     * Cuenta cada semanticTag y lo agrega al array contadorSemanticTags
     */

    contarSemanticTags(resultados): any {
        // resultados = resultados && resultados[0].frecuencia ? resultados.map(x => x.concepto) : resultados;

        this.contadorSemanticTags = {
            hallazgo: 0,
            trastorno: 0,
            procedimiento: 0,
            entidadObservable: 0,
            situacion: 0,
            producto: 0,
            regimenTratamiento: 0
        };

        let tag;

        resultados.forEach(x => {
            tag = x.semanticTag && x.semanticTag === 'entidad observable' ? 'entidadObservable' : (x.semanticTag === 'régimen/tratamiento' ? 'regimenTratamiento' : x.semanticTag);
            this.contadorSemanticTags[String(tag)]++;
        });

    }
    /**
     *
     * @param filtro Le pasamos el o los semanticTags a filtrar
     * @param tipo le pasamos el tipo de busqueda por ejemplo Plan.
     * @param arrayAFiltrar Le podemos pasar un array de conceptos a filtrar
     * Por defecto la funcion trabaja con el array de resultados pero si le pasamos un array
     * disitinte de conceptos nos retorna el resultado.
     */

    filtroBuscadorSnomed(filtro: any[], tipo = null) {

        if (this.resultados.length >= this.resultadosAux.length && !this.loading) {
            this.resultadosAux = this.resultados;
        } else {
            this.resultados = this.resultadosAux;
        }
        this.resultados = this.resultadosAux.filter(x => filtro.find(y => y === x.semanticTag));

        if (tipo !== 'planes') {
            this.resultados = this.resultados.filter(x => {
                if (!this.conceptosTurneables.find(y => y.conceptId === x.conceptId)) {
                    return x;
                }
            });
        }

        // OK..
        this.tipoBusqueda = tipo ? tipo : '';
        this.filtroActual = tipo ? ['planes'] : filtro;
        this.tagBusqueda.emit(this.filtroActual);
        this.esFiltroActual = this.getFiltroActual(filtro);

        return this.resultados;

    }

    // :joy:
    getFiltroActual(filtro: any[]) {
        return this.filtroActual.join('') === filtro.join('');
    }

    /**
     *
     * @param filtro recibe los semnatictags a filtrar
     * @param tipo tipo a buscar
     * Llama a la funcion this.filtroBuscadorSnomed con el array de frecuentes.
     */
    filtroFrecuentes(filtro, tipo = null) {
        // if (this.arrayFrecuentes.length >= this.resultadosFrecuentesAux.length && !this.loading) {
        //     this.resultadosFrecuentesAux = this.arrayFrecuentes;
        // } else {
        this.arrayFrecuentes = this.resultadosFrecuentesAux.map(x => x.concepto);
        // }
        this.arrayFrecuentes = this.arrayFrecuentes.filter(x => filtro.find(y => y === x.semanticTag));
        if (tipo !== 'planes') {
            this.arrayFrecuentes = this.arrayFrecuentes.filter(x => {
                if (!this.conceptosTurneables.find(y => y.conceptId === x.conceptId)) {
                    return x;
                }
            });
        }

        // OK..
        this.tipoBusqueda = tipo ? tipo : '';
        this.filtroActual = tipo ? ['planes'] : filtro;
        this.tagBusqueda.emit(this.filtroActual);
        this.esFiltroActual = this.getFiltroActual(filtro);
    }
    /**
     * si hago clic en un concepto, entonces lo devuelvo
     */
    seleccionarConcepto(concepto) {
        this.filtroActual = this.esTurneable(concepto) ? ['planes'] : this.filtroActual;

        this.tagBusqueda.emit(this.filtroActual);
        this.evtData.emit(concepto);
    }

    /**
     * La funcion filtroRefSet tiene un objeto de conceptos con un array de los semanticTags
     * que son los filtros
     * Se va a mostrar en los desplegables los resultados filtrados, los guarda en
     * arrayPorRefsets
     */
    filtroRefSet() {
        let frecuentes = [];
        let conceptos = {
            Hallazgos: ['hallazgo', 'situacion'],
            Trastornos: ['trastorno'],
            Procedimientos: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
            Planes: ['procedimiento', 'régimen/tratamiento'],
            Productos: ['producto']
        };
        this.arrayPorRefsets = [];
        Object.keys(this.servicioPrestacion.refsetsIds).forEach(k => {
            let nombre = k.replace(/_/g, ' ');
            this.arrayPorRefsets.push({
                nombre: nombre,
                valor: this.resultados.filter(x => x.refsetIds.find(item => item === this.servicioPrestacion.refsetsIds[k]))
            });
            frecuentes.push({
                nombre: nombre,
                valor: this.arrayFrecuentes.filter(x => x.refsetIds.find(item => item === this.servicioPrestacion.refsetsIds[k]))
            });
        });
        Object.keys(conceptos).forEach(c => {
            this.arrayPorRefsets.push({
                nombre: c,
                valor: this.resultadosAux.filter(x => conceptos[c].find(y => y === x.semanticTag))
            });
            frecuentes.push({
                nombre: c,
                valor: this.arrayFrecuentes.filter(x => conceptos[c].find(y => y === x.semanticTag))
            });
        });

    }

    /**
     *
     * @param i Recibe la posicion Index del array
     * @param nombre Se le pasa el nombre del objeto de la posicion i
     * La funcion despliega los desplegables de la busqueda guiada.
     * Al abrir uno automaticamente cierra el que anteriormente se abrio.
     */
    desplegar(i, nombre) {
        if (this.showContent === nombre) {
            this.showContent = null;
        } else {
            this.showContent = nombre;
        }
        let tipo = nombre.toLowerCase();
        let filtro: any = [];
        switch (tipo) {
            case 'hallazgo':
                filtro = ['hallazgo', 'situación'];
                break;
            case 'trastorno':
                filtro = ['trastorno'];
                break;
            case 'procedimiento':
                filtro = ['procedimiento', 'entidad observable', 'régimen/tratamiento'];
                break;
            case 'planes':
                filtro = ['planes'];
                break;
            case 'producto':
                filtro = ['producto'];
                break;

        }
        // OK..
        this.tipoBusqueda = tipo ? tipo : '';
        this.filtroActual = filtro;
        this.tagBusqueda.emit(this.filtroActual);
        this.esFiltroActual = this.getFiltroActual(filtro);

    }

    esTurneable(item) {
        return this.conceptosTurneables.find(x => {
            return x.conceptId === item.conceptId;
        });
    }

    public reemplazar(arr, glue) {
        return arr.join(glue);
    }

}
