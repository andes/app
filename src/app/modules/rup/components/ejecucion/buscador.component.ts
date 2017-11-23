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
    // public showFrecuentes = false;

    public loading = false;
    public filtroActual = [];
    public esFiltroActual = false;

    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    /*
    // Tipo de busqueda: hallazgos y trastornos / antecedentes / anteced. familiares
    public tipoBusqueda: String = '';
    */
    public contadorSemanticTags = {
        hallazgo: 0,
        trastorno: 0,
        procedimiento: 0,
        entidadObservable: 0,
        situacion: 0
    };

    public resultadosAux: any[] = [];
    public elementRef;
    public arrayPorRefsets = [];
    public showRefSets = false;

    public showContent;

    // Arra de salida para los mas frecuentes
    public arrayFrecuentes: any[] = [];
    // Boolean para mostrar lo mas fecuentes
    public showFrecuentes = false;

    // TODO Ver si lo dejamos asi
    public _dragScope = ['registros-rup', 'vincular-registros-rup'];


    constructor(public servicioTipoPrestacion: TipoPrestacionService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService) {
    }

    ngOnInit() {
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
        // Hay más frecuentes?
        // Frecuentes de este profesional
        this.frecuentesProfesionalService.getById(this.auth.profesional.id).subscribe(resultado => {
            let frecuentes = [];
            // Esperamos que haya un resultado de más frecuentes antes de mostrar los resultados completos
            this.contadorSemantigTags(resultadosSnomed);
            if (resultado && resultado[0] && resultado[0].frecuentes) {
                // Si hay un concepto frecuente en la lista de resultados, se lo mueve al tope de la lista con Array.unshift()
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
                this.resultados = resultadosSnomed;
                // Agrego los mas frecuentes del profesional
                this.arrayFrecuentes = frecuentes;
                // Se llama a la funcion que arma los filtros por refsetId
                this.filtroRefSet();
            }
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

    contadorSemantigTags(resultados): any {
        this.contadorSemanticTags = {
            hallazgo: 0,
            trastorno: 0,
            procedimiento: 0,
            entidadObservable: 0,
            situacion: 0
        };

        let tag;

        resultados.forEach(x => {
            tag = x.semanticTag && x.semanticTag === 'entidad observable' ? 'entidadObservable' : x.semanticTag;
            this.contadorSemanticTags[String(tag)]++;
        });

    }
    /**
     *
     * @param filtro Le pasamos el semanticTag a filtrar.
     * @param tipo Le pasamos el tipo de busqueda a ejecutar.
     * La funcion nos filtra los resultados segun el filtro y el tipo que le pasamos.
     */

    filtroBuscadorSnomed(filtro: any[], tipo = null) {
        if (this.resultados.length >= this.resultadosAux.length && !this.loading) {
            this.resultadosAux = this.resultados;
        } else {
            this.resultados = this.resultadosAux;
        }
        this.resultados = this.resultadosAux.filter(x => filtro.find(y => y === x.semanticTag));
        this.tipoBusqueda = tipo ? tipo : '';
        this.filtroActual = tipo ? ['planes'] : filtro;
        this.esFiltroActual = this.getFiltroActual(filtro);
        return this.resultados;
    }

    // :joy:
    getFiltroActual(filtro: any[]) {
        return this.filtroActual.join('') === filtro.join('');
    }

    /**
     * si hago clic en un concepto, entonces lo devuelvo
     */
    seleccionarConcepto(concepto) {
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
        let conceptos = {
            Hallazgos: ['hallazgo', 'situacion'],
            Trastornos: ['trastorno'],
            Procedimientos: ['procedimiento', 'entidad observable'],
            Planes: ['procedimiento']
        };
        this.arrayPorRefsets = [];
        Object.keys(this.servicioPrestacion.refsetsIds).forEach(k => {
            let nombre = k.replace(/_/g, ' ');
            this.arrayPorRefsets.push({ nombre: nombre, valor: this.resultados.filter(x => x.refsetIds.find(item => item === this.servicioPrestacion.refsetsIds[k])) });
        });
        Object.keys(conceptos).forEach(c => {
            this.arrayPorRefsets.push({ nombre: c, valor: this.filtroBuscadorSnomed(conceptos[c]) });
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

    }


     // Recibe el parametro y lo setea para realizar la busqueda en Snomed
    // filtroBuscadorSnomed(tipoBusqueda) {

    //     this.tipoBusqueda = !tipoBusqueda ? 'todos' : tipoBusqueda;

    //     this.masFrecuentesFiltradas = [];
    //     this.masFrecuentes.forEach(element => {

    //         let semanticTag: String;
    //         switch (tipoBusqueda) {
    //             case 'trastorno':
    //             case 'hallazgo':
    //             case 'problema':
    //                 semanticTag = 'hallazgo';
    //                 break;
    //             case 'procedimiento':
    //                 semanticTag = 'procedimiento';
    //                 break;
    //             case 'planes':
    //                 semanticTag = 'planes';
    //                 break;
    //             case 'todos':
    //                 // '"hallazgo" "trastorno" "situacion" "entidad observable" "procedimiento"'
    //                 semanticTag = 'todos';
    //                 break;
    //         }

    //         if (semanticTag === tipoBusqueda) {
    //             this.masFrecuentesFiltradas.push(element);
    //         }
    //     });

    //     this.tipoBusqueda = tipoBusqueda;

    //     // <rup-buscador> en prestacionEjecucion.html
    //     this._tipoDeBusqueda.emit(tipoBusqueda);
    // }

    // Emito el concepto seleccionado
    // seleccionBusqueda(concepto) {
    //     this.evtData.emit(concepto);
    //     this._tipoDeBusqueda.emit(this.tipoBusqueda);

    // }

    // Recupero los mas frecuentes de los elementos rup y creo el objeto con los
    // conceptos de snomed
    // recuperaLosMasFrecuentes(elementoRUP) {
    //     debugger;
    //     elementoRUP.frecuentes.forEach(element => {
    //         this.masFrecuentes.push(element);
    //     });
    // }
    // Capturo el emit de snomed y seteo la variable para mostrar o ocultar los mas frecuentes.
    //     mostrarMasfrecuentes(mostrar) {
    //         this.showFrecuentes = mostrar;
    //     }

}
