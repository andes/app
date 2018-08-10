import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
@Component({
    selector: 'rup-percentilo-de-tension-arterial',
    templateUrl: 'percentiloDeTensionArterial.html'
})
export class PercentiloDeTensionArterialComponent extends RUPComponent implements OnInit {
    ngOnInit() {
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
