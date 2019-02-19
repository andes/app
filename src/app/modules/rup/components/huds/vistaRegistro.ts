import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';

@Component({
    selector: 'vista-registro',
    templateUrl: 'vistaRegistro.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaRegistroComponent implements OnInit {

    @Input() registro: IPrestacionRegistro = null;
    @Input() prestacion: IPrestacion = null;
    @Input() evolucionActual: any = null;
    @Input() indice = 0;

    constructor() { }

    ngOnInit() {

    }

}
