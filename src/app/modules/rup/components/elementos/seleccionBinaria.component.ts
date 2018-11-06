import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-seleccion-binaria',
    templateUrl: 'seleccionBinaria.html'
})

export class SeleccionBinariaComponent extends RUPComponent implements OnInit {

    public options;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = null;
        }
        this.options = this.params.defaultOptions;
    }

}
