import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-internacionEgreso',
    templateUrl: 'internacionEgreso.html'
})
@RupElement('InternacionEgresoComponent')
export class InternacionEgresoComponent extends RUPComponent implements OnInit {

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeEgreso: {}
            };
        }
    }

}
