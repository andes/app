import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: '../core/rup.html'
})
@RupElement('MoleculaBaseComponent')
export class MoleculaBaseComponent extends RUPComponent implements OnInit {
    sexo: any;
    ngOnInit() {
        if (this.params && this.params.hasSections) {
            this.registro.hasSections = true;
        }
        if (this.params && this.params.filter) {
            this.sexo = this.paciente.sexo;
        }
    }
}
