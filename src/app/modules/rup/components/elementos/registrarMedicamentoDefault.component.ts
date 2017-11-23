import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
@Component({
    selector: 'rup-registrarMedicamentoDefault',
    templateUrl: 'registrarMedicamentoDefault.html'
})
export class RegistrarMedicamentoDefaultComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'dosis' en otro elemento RUP
        this.conceptObserverService.observe(this.registro).subscribe((data) => {
            if (this.registro.valor !== data.valor) {
                this.registro.valor = data.valor;
                this.emitChange(false);
            }
        });
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
        }
    }
}
