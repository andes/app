import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-circunferencia-de-cintura',
    templateUrl: 'circunferenciaCintura.html'
})

export class CircunferenciaCinturaComponent extends RUPComponent implements OnInit {
    ngOnInit() {

        // Observa cuando cambia la propiedad 'Circunferencia de la cintura' en otro elemento RUP
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro !== data && this.registro.valor !== data.valor) {
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
