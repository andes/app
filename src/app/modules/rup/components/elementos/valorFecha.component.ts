import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-valor-fecha',
    templateUrl: 'valorFecha.html'
})
@RupElement('ValorFechaComponent')
export class ValorFechaComponent extends RUPComponent implements OnInit {
    get DateFormat() {
        switch (this.params.type) {
            case 'date':
                return (this.registro.valor) ? moment(this.registro.valor).format('DD/MM/YYYY') : 'Sin fecha';
            case 'datetime':
                return (this.registro.valor) ? moment(this.registro.valor).format('DD/MM/YYYY hh:mm') : 'Sin fecha';
            case 'time':
                return (this.registro.valor) ? moment(this.registro.valor).format('hh:mm') : 'Sin hora';
            default:
                break;
        }
    }
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = null;
        }
    }

    onChange() {
        this.emitChange();
        this.mensaje = {};
        this.addFact('value', this.registro.valor);
    }
}
