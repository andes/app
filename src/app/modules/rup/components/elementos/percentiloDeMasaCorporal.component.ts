import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
@Component({
    selector: 'rup-percentilo-imc',
    templateUrl: 'percentiloDeMasaCorporal.html'
})
export class PercentiloDeMasaCorporalComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        if (this.registro.valor == null) {
            this.registro.valor = 0;
        }

        if (!this.soloValores) {
            // Observa cuando cambia la propiedad 'percentiloPeso' en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
        }
    }
}
