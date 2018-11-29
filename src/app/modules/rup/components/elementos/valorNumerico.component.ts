import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-valor-numerico',
    templateUrl: 'valorNumerico.html'
})

export class ValorNumericoComponent extends RUPComponent implements OnInit {


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = 0;
        }
    }

}
