import { IHojaTrabajo } from './../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { Input, Output, Component, OnInit } from '@angular/core';

@Component({
    selector: 'encabezado-hojatrabajo',
    templateUrl: './encabezado-hojatrabajo.html'
})
export class EncabezadoHojatrabajoComponent implements OnInit {

    @Input() hojaTrabajo: IHojaTrabajo;

    constructor() { }

    ngOnInit() {
    }

}
