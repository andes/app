import { IHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { Component, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';


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
    @Input() areas: any[];

    constructor(
        public plex: Plex
    ) { }

    ngOnInit() {
    }

    getAreas() {
        return this.areas;
    }
}
