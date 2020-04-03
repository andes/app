import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

/**
 * [DEPRECATED] Cambiar desde base de datos a ObservacionesComponent
 */

@Component({
    selector: 'rup-informe',
    templateUrl: 'informe.html'
})
@RupElement('InformesComponent')
export class InformesComponent extends RUPComponent implements OnInit, AfterViewInit {
    afterInit = false;
    public referenceSet = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    ngOnInit() {
        if (!this.registro.valor || this.registro.valor.length === 0) {
            this.afterInit = true;
        }

        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
    }
}
