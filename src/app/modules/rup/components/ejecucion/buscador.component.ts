import { element } from 'protractor';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']

})

export class BuscadorComponent implements OnInit {
    @Input() elementoRUPprestacion;
    @Input() arrayFrecuentes;
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

    // array de los mas frecuentes..
    public masFrecuentes: any[] = [];
    // Array de las mas frecuentes filtradas por semantictag de snomed
    public masFrecuentesFiltradas: any[] = [];
    public showFrecuentes = false;

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

    constructor(public servicioTipoPrestacion: TipoPrestacionService,
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

    recibeResultados($event) {
        this.resultados = $event;
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

    // si hago clic en un concepto lo capturo y lo devuelvo
    // Lo trae del buscador de SNOMED
    ejecutarConcepto(concepto) {
        this.evtData.emit(concepto);
        // this.recuperaLosMasFrecuentes(this.elementoRUPpretacion);
    }

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
     * Handler para cuando se ejecuta un click en el documento.
     * @param event  Click event
     * @returns      Void
     */
    handleClick(event): void {
        // buscamos que elemento fue clickeado
        let clickedComponent = event.target;

        // creamos una bandera para saber si pertenece a este componente
        let inside = false;

        // loopeamos
        do {
            // si hice click dentro del codigo html del componente
            // entonces indico que estoy adentro (inside = true)
            // y no oculto la lista de resultados
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;

                this.hideLista = false;
            }

            // info de que componente hice clic
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        // si no estamos en el componente, limpiamos lista de problemas
        if (!inside && !this._draggable) {
            // this.resultados = [];
            // this.hideLista = true;
            // this.searchTerm = '';
        }
    }

    // si hago clic en un concepto, entonces lo devuelvo
    seleccionarConcepto(concepto) {
        // this.resultados = this.resultadosAux = [];
        // this.searchTerm = '';
        // this.contadorSemanticTags = {
        //     hallazgo: 0,
        //     trastorno: 0,
        //     procedimiento: 0,
        //     entidadObservable: 0,
        //     situacion: 0
        // };
        this.tagBusqueda.emit(this.filtroActual);
        this.evtData.emit(concepto);
    }

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

    desplegar(i, nombre) {
        if (this.showContent === nombre) {
            this.showContent = null;
        } else {
            this.showContent = nombre;
        }

    }

}
