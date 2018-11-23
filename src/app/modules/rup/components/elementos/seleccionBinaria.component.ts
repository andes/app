import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-seleccion-binaria',
    templateUrl: 'seleccionBinaria.html'
})

export class SeleccionBinariaComponent extends RUPComponent implements OnInit {

    public options;
    public valor;
    public label;

    ngOnInit() {
        this.label = this.params.title ? this.params.title : this.registro.concepto.term;
        this.options = this.params.defaultOptions;
        if (!this.registro.valor) {
            this.registro.valor = null;
        } else {
            this.valor = this.registro.valor.id;
        }
    }

    onChange() {
        this.registro.valor = this.options.find(i => i.id === this.valor);
    }

}
