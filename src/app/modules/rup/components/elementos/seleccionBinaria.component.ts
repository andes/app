import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';

@Component({
    selector: 'rup-seleccion-binaria',
    templateUrl: 'seleccionBinaria.html'
})
@RupElement('SeleccionBinariaComponent')
export class SeleccionBinariaComponent extends RUPComponent implements OnInit {

    public options: any;
    public valor: any;
    public label: any;
    private newRegistro: IPrestacionRegistro;

    ngOnInit() {
        this.label = this.params && this.params.title ? this.params.title : this.registro.concepto.term;
        this.options = this.params.defaultOptions;
        if (!this.registro.valor) {
            this.registro.valor = null;
        } else {
            this.valor = this.registro.valor.id;
        }
    }

    onChange() {
        this.registro.valor = this.options.find((i: any) => i.id === this.valor);
        if (this.registro.valor.value) {
            this.newRegistro = new IPrestacionRegistro(null, this.registro.valor.value);
            this.registro.registros = [...this.registro.registros, this.newRegistro];
        }
        this.emitChange();
    }

}
