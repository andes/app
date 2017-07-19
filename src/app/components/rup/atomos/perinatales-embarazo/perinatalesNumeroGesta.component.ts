import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";


@Component({
    selector: 'rup-PerinatalesNumeroGesta',
    templateUrl: 'perinatalesNumeroGesta.html'
})
export class PerinatalesNumeroGestaComponent extends Atomo {

    getMensajes() {
        let NroGesta;
        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };
        NroGesta = this.data[this.elementoRUP.key];
        if (NroGesta === 1) { mensaje.texto = 'Primigesta' }
        return mensaje;
    }
}
