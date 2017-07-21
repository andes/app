import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'formula',
    templateUrl: 'formula.html'
})
export class Formula extends RupComponent {

    ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : null;
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.devolverValores();
        }
    }

}
