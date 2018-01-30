import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-riesgoCardiovascular',
    templateUrl: 'riesgoCardiovascular.html'
})
export class RiesgoCardiovascularComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'RiesgoCardiovascular' en otro elemento RUP
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
