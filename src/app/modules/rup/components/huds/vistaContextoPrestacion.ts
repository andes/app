import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'vista-contexto-prestacion',
    templateUrl: 'vistaContextoPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaContextoPrestacionComponent implements OnInit {

    @Input() registro: IPrestacionRegistro;
    @Input() prestacion: IPrestacion;

    constructor(public _prestacionesService: PrestacionesService) { }

    ngOnInit() {

    }

}
