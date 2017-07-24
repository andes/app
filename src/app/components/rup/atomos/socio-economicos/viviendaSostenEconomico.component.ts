import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";

@Component({
    selector: 'rup-ViviendaSostenEconomico',
    templateUrl: 'viviendaSostenEconomico.html'
})

export class ViviendaSostenEconomicoComponent extends Atomo {
       ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {
            trabaja: null,
            horas: null
        };
        if (this.data[this.elementoRUP.key].valor) {
            this.devolverValores();
        }
    }
}
