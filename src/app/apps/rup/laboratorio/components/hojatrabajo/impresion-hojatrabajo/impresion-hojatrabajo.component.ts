import { IHojaTrabajo } from './../../../interfaces/IHojaTrabajo';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'impresion-hojatrabajo',
    templateUrl: './impresion-hojatrabajo.html'
})
export class ImpresionHojatrabajoComponent implements OnInit {

    opcionesFormato = [{ id: 'A4', label: 'A4' }, { id: 'Oficio', label: 'Oficio' }];
    opcionesOrientacion = [{ id: 'Horizontal', label: 'Horizontal' }, { id: 'Vertical', label: 'Vertical' }];
    formato = 'A4';
    orientacion = 'Horizontal';

    @Input() hojaTrabajo: IHojaTrabajo;
    constructor() { }

    ngOnInit() {
    }

}
