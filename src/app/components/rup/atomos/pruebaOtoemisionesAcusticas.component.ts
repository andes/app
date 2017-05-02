import { Atomo } from './../core/atomoComponent';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-PruebaOtoemisionesAcusticas',
    templateUrl: 'pruebaOtoemisionesAcusticas.html'
})
export class PruebaOtoemisionesAcusticasComponent extends Atomo {
   
    public selectPruebaOtoemisionesAcusticas: Array<Object> = [
        { id: 'si', nombre: 'Si' },
        { id: 'no', nombre: 'No' },
        { id: ' no se hizo', nombre: ' No se hizo' },
        { id: 'sin información', nombre: 'Sin información' },
    ];
   
    getMensajes() {
        let mensaje: any = {
            texto: '',
            class: 'danger'
        };
        if (this.data[this.tipoPrestacion.key].id != 'si') {
            mensaje.texto = 'alarma'; //ver el texto que va a alertar
        }
        return mensaje;
    }
}