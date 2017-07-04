import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';


@Component({
    selector: 'rup-buscador',
    templateUrl: 'buscador.html',

})

export class BuscadorComponent implements OnInit {

    /**
     * Devuelve un elemento seleccionado.
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    public searchPlanes: String = '';
    //Lista de planes.
    public listaPlanes: any[] = [];
     // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    //Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda: string = 'problemas'; //Por defecto trae los problemas
    public showPlanes: boolean = false;
    public ejecucion: any[] = [];


    constructor(public servicioTipoPrestacion: TipoPrestacionService) {
    }

    ngOnInit() { }


    //drag and drop funciones
    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }

    // Buscador de planes
    buscar() {
        if (this.searchPlanes !== null) {
            this.servicioTipoPrestacion.get({ term: this.searchPlanes }).subscribe(tiposPrestacion => {
                this.listaPlanes = tiposPrestacion;
            });
        } else {
            this.listaPlanes = [];
        }
    }

    //Recibe el parametro y lo setea para realizar la busqueda en Snomed
    filtroBuscadorSnomed(tipoBusqueda) {
        this.showPlanes = false;// Oculta el buscador de planes
        console.log(tipoBusqueda);
        this.tipoBusqueda = tipoBusqueda;
    }
    //Muestra el buscador de planes
    busquedaPlanes() {
        this.tipoBusqueda = 'planes';
        this.showPlanes = true;
    }

    seleccionBusqueda(concepto) {
        // this.resultados = [];
        // this.searchTerm = '';
        this.evtData.emit(concepto);
    }

     // si hago clic en un concepto lo capturo y lo devuelvo
     // Lo trae del buscador de SNOMED 
    ejecutarConcepto(concepto) {
        console.log(concepto);
        this.evtData.emit(concepto);
    }
}