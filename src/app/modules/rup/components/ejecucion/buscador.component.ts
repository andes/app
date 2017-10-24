import { element } from 'protractor';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',
    styleUrls: ['buscador.scss']

})

export class BuscadorComponent implements OnInit {
    @Input() elementoRUPprestacion;
    @Input() arrayFrecuentes;
    /**
     * Devuelve un elemento seleccionado.
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();
    // emito el tipo de busqueda para que lo reciba el buscador SNOMED.
    @Output() _tipoDeBusqueda: EventEmitter<any> = new EventEmitter<any>();

    // Lista de planes.
    public listaPlanes: any[] = [];
    // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    // Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda = 'problemas'; // Por defecto trae los problemas
    // public showPlanes = false;
    public ejecucion: any[] = [];

    // array de los mas frecuentes..
    public masFrecuentes: any[] = [];
    // Array de las mas frecuentes filtradas por semantictag de snomed
    public masFrecuentesFiltradas: any[] = [];
    public showFrecuentes = false;

    public loading = false;

    /**
     * [TODO] searchPlanes: Agregado para que compile con AOT
     */
    public searchPlanes = null;

    constructor(public servicioTipoPrestacion: TipoPrestacionService) {
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

    // Recibe el parametro y lo setea para realizar la busqueda en Snomed
    filtroBuscadorSnomed(tipoBusqueda) {

        this.tipoBusqueda = tipoBusqueda === 'problemas' ? 'hallazgos' : tipoBusqueda;
        console.log('tipoBusqueda', this.tipoBusqueda);

        this.masFrecuentesFiltradas = [];
        this.masFrecuentes.forEach(element => {

            let semanticTag: String;
            switch (element.semanticTag) {
                case 'trastorno':
                case 'hallazgo':
                case 'problema':
                    semanticTag = 'problemas';
                    break;
                case 'procedimiento':
                    semanticTag = 'procedimientos';
                    break;
                case 'planes':
                    semanticTag = 'procedimientos';
                    break;
            }

            if (semanticTag === tipoBusqueda) {
                this.masFrecuentesFiltradas.push(element);
            }
        });

        this.tipoBusqueda = tipoBusqueda;
        this._tipoDeBusqueda.emit(tipoBusqueda);
    }

    // Emito el concepto seleccionado
    seleccionBusqueda(concepto) {
        this.evtData.emit(concepto);
    }

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
    mostrarMasfrecuentes(mostrar) {
        this.showFrecuentes = mostrar;
    }
}
