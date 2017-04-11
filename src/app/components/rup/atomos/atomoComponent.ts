import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'Atomo',
    templateUrl: 'atomo.html'
})
export class Atomo extends RupComponent {

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.devolverValores();
        }
    }
    devolverValores() {

        if (this.data[this.tipoPrestacion.key] === null) {
            this.data = {};
        }
        this.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }

    getMensajes() {


    }
}