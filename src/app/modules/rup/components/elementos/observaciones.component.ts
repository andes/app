import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent extends RUPComponent implements OnInit {
    public referentSet = [];
    ngOnInit() {
        this.registro.valido = true;
        // Observa cuando cambia la propiedad 'Sistolica' en otro elemento RUP
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
