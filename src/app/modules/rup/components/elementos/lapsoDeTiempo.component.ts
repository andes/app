import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';

@Component({
    selector: 'rup-lapso-de-tiempo',
    templateUrl: 'lapsoDeTiempo.html'
})
export class LapsoDeTiempoComponent extends RUPComponent implements OnInit {
    conceptos: any[];
    seleccionados: any[];

    ngOnInit() {
        if (this.registro) {
            if (this.registro.valor) {
                this.registro.valor = [];
            }
        }
    }


}
