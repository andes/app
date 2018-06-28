import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-consulta-nino-sano-m2a',
    templateUrl: '../core/rup.html'
})
export class ConsultaDeNinoSanoE3Y6AComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
