import { IHojaTrabajo } from './../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { Input, Output, Component, OnInit } from '@angular/core';

@Component({
    selector: 'carga-hojatrabajo',
    templateUrl: './carga-hojatrabajo.html'
})
export class CargaHojatrabajoComponent implements OnInit {

    @Input() hojaTrabajo: IHojaTrabajo;

    constructor() { }

    ngOnInit() {
    }

}
