import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
@Component({
    selector: 'rup-percentiloPerimetroCefalico',
    templateUrl: 'percentiloPerimetroCefalico.html'
})
export class PercentiloPerimetroCefalicoComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        if (!this.soloValores) {
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
