import { Atomo } from './../../core/atomoComponent';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-edadGestacional',
    templateUrl: 'edadGestacional.html'
})
export class EdadGestacionalComponent extends Atomo {
    
    getMensajes() {

        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };
        if (this.data[this.tipoPrestacion.key]) {
            switch (true) {
                //Validaciones con los mensajes.
                case (this.data[this.tipoPrestacion.key] >= 42):
                    mensaje.texto = "Postmaduro";
                    mensaje.class = "outline-danger";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 37 && this.data.valor <= 41):
                    mensaje.texto = "A termino";
                    mensaje.class = "outline-succes";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 35 && this.data.valor <= 36):
                    mensaje.texto = "Prematuro Leve";
                    mensaje.class = "outline-warning";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 32 && this.data.valor <= 34):
                    mensaje.texto = "Prematuro moderado";
                    mensaje.class = "outline-danger";
                    break;
                case (this.data[this.tipoPrestacion.key] < 32):
                    mensaje.texto = "Prematuro extremo";
                    mensaje.class = "outline-danger";
                    break;
            }
        }
        return mensaje;
    }
}