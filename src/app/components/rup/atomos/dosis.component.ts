import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-Dosis',
    templateUrl: 'dosis.html'
})
export class DosisComponent extends Atomo implements OnInit{
   
    public unidades: Array<Object> = [
    { id: 'miligramos', nombre: 'Miligramos' },
    { id: 'gramos', nombre: 'Gramos' },
    ];

    ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            // this.devolverValores();
            this.mensaje = this.getMensajes();
        }
    }
}