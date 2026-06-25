import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-autonumerico',
    templateUrl: 'autonumerico.html'
})
@RupElement('AutonumericoComponent')
export class AutonumericoComponent extends RUPComponent implements OnInit {

    ngOnInit() {
        if (!this.registro.valor && !this.soloValores) {
            if (this.params?.source) {
                this.constantesService['server'].get(`/modules/constantes/next/${this.params.source}`)
                    .subscribe(constante => {
                        if (constante) {
                            // El endpoint 'next' ya incrementó el valor en la DB
                            this.registro.valor = constante.valor || constante.key;
                            this.emitChange(false);
                        }
                    });
            }
        }
    }
}

