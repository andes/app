import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-internacionIngreso',
    templateUrl: 'internacionIngreso.html'
})
@RupElement('InternacionIngresoComponent')
export class InternacionIngresoComponent extends RUPComponent implements OnInit {

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeIngreso: {}
            };
        }
    }

}
