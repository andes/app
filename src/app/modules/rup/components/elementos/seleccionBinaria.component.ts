import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-seleccion-binaria',
    templateUrl: 'seleccionBinaria.html'
})
@RupElement('SeleccionBinariaComponent')
export class SeleccionBinariaComponent extends RUPComponent implements OnInit {

    public options = null;
    public valor = null;
    public label = null;
    public okayOptions = null;
    public showOkayOptions = null;

    ngOnInit() {
        this.label = this.params && this.params.title ? this.params.title : this.registro.concepto.term;
        this.options = this.params.defaultOptions;
        this.okayOptions = this.params.okayOptions ? this.params.okayOptions : null;
        if (!this.registro.valor) {
            this.registro.valor = null;
        } else {
            this.valor = this.registro.valor.id;
            this.showOkayOptions = (this.okayOptions && this.okayOptions.some(opt => this.valor === opt.id));
        }
    }

    onChange() {
        this.registro.valor = this.options.find(i => i.id === this.valor);
        (this.valor === 'Si' && this.okayOptions) ? (this.showOkayOptions = true) : (this.showOkayOptions = false);
        this.emitChange();
    }

    onChangeOkayOpt() {
        this.registro.valor = this.okayOptions.find(i => i.id === this.valor);
        this.emitChange();
    }
}
