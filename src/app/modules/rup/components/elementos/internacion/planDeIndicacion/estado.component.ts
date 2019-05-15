import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../../../core/rup.component';
import { RupElement } from '../..';

@Component({
    selector: 'estado',
    templateUrl: 'estado.html',
    styleUrls: ['estado.scss']
})
@RupElement('EstadoComponent')
export class EstadoComponent extends RUPComponent implements OnInit {
    public existeReg = false;
    public esRequerido: boolean;
    public marcado: boolean;


    ngOnInit() {
        this.marcado = true;
        if (this.params) {
            this.esRequerido = this.params.required;
        } else { this.esRequerido = false; }

    }

    public validate() {
        // La primera vez
        if (this.registro && this.registro.valor) {
            if (!this.registro.valor.existeRegistro) {
                return true;
            }
            if (this.registro.valor.estado) {
                return true;
            } else {
                this.marcado = false;
                return false;
            }
        } else {
            return true;
        }
    }



    cambiaEstado(estado) {
        this.registro.valor = { estado: estado, existeRegistro: this.registro.valor.existeRegistro };
    }


}
