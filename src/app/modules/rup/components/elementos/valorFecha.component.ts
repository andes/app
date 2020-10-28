import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import * as moment from 'moment';
@Component({
    selector: 'rup-valor-fecha',
    templateUrl: 'valorFecha.html'
})
@RupElement('ValorFechaComponent')
export class ValorFechaComponent extends RUPComponent implements OnInit {
    get DateFormat() {
        switch (this.params.type) {
            case 'date':
                return moment(this.registro.valor).format('DD/MM/YYYY');
            case 'datetime':
                return moment(this.registro.valor).format('DD/MM/YYYY hh:mm');
            case 'time':
                return moment(this.registro.valor).format('hh:mm');
            default:
                break;
        }
    }
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = null;
        }
    }
}
