import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';

@Component({
    selector: 'rup-valor-numerico',
    templateUrl: 'valorNumerico.html'
})

export class ValorNumericoComponent extends RUPComponent implements OnInit {
    public label;

    ngOnInit() {
        this.label = this.params && this.params.title ? this.params.title : this.registro.concepto.term;
        if (!this.registro.valor) {
            this.registro.valor = 0;
        }
        if (!this.soloValores) {
            // Observa cuando cambia la propiedad '' en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor && (this.params.observe === undefined || this.params.observe)) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
    }
}
