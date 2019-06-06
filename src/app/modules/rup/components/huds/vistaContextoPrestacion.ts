import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';

@Component({
    selector: 'vista-contexto-prestacion',
    templateUrl: 'vistaContextoPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaContextoPrestacionComponent implements OnInit {

    @Input('registro')
    set registro(value: IPrestacionRegistro) {
        this._registro = value;
    }
    get registro() {
        return this._registro;
    }
    @Input('prestacion')
    set prestacion(value: IPrestacion) {
        this._prestacion = value;
    }
    get prestacion() {
        return this._prestacion;
    }

    _registro: IPrestacionRegistro;
    _prestacion: IPrestacion;
    constructor() { }

    ngOnInit() {

    }

}
