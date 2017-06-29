import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
@Component({
    selector: 'buscador-planes',
    templateUrl: 'buscadorPlanes.html'
})

export class BuscadorPlanesComponent implements OnInit {
    //Queda agregar los inputs y outputs del frag and drop!!
    //Parametro de entrada..
    public searchPlanes: String = '';
    //Lista de planes.
    public listaPlanes: any[] = [];

    constructor(public servicioTipoPrestacion: TipoPrestacionService) {
    }

    ngOnInit() { }


    buscar() {
        if (this.searchPlanes !== null) {
            this.servicioTipoPrestacion.get({ term: this.searchPlanes }).subscribe(tiposPrestacion => {
                this.listaPlanes = tiposPrestacion;
            });
        } else {
            this.listaPlanes = [];
        }
    }
}