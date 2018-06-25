import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-consulta-nino-sano-m2a',
    templateUrl: '../core/rup.html'
})
export class ConsultaDeNinoSanoM2AComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        this.registro.valor = {
            valido: true
        };
    }
}
