import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'peso' en otro elemento RUP
        this.conceptObserverService.observe(this.registro).subscribe((data) => {
            if (this.registro.valor !== data.valor) {
                this.registro.valor = data.valor;
                this.emitChange(false);
            }
        });
    }
}
