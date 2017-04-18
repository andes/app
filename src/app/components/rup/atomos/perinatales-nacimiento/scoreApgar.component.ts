import { Atomo } from './../atomoComponent';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-scoreApgar',
    templateUrl: 'scoreApgar.html'
})
export class ScoreApgarComponent extends Atomo {

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            minutos: null
        };
        if (this.data[this.tipoPrestacion.key].valor) {
            this.devolverValores();
        }
    }

    getMensajes() {

        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };

        if (this.data[this.tipoPrestacion.key]) {
            //Validaciones con los mensajes.
            if (this.data[this.tipoPrestacion.key].valor >= 7 && this.data[this.tipoPrestacion.key].valor <= 10) {
                mensaje.texto = "Excelente";
                mensaje.class = "outline-succes";
            }
            if (this.data[this.tipoPrestacion.key].valor >= 4 && this.data[this.tipoPrestacion.key].valor <= 6) {
                mensaje.texto = "Moderadamente Deprimido";
                mensaje.class = "outline-warning";
            }
            if (this.data[this.tipoPrestacion.key].valor >= 0 && this.data[this.tipoPrestacion.key].valor <= 3) {
                mensaje.texto = "Severamente Deprimido";
                mensaje.class = "outline-danger";
            }
        }
        return mensaje;
    }
}