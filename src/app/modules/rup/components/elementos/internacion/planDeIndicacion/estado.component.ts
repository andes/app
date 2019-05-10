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
    ngOnInit() {
        if (this.registro && this.registro.valor && this.registro.valor.existeRegistro) {
            if (!this.registro.valor.estado) {
                this.registro.valor = { estado: 'activo', existeRegistro: this.registro.valor.existeRegistro };

            }
        }

    }

    // public validate() {
    //     return false;
    // }

    cambiaEstado(estado) {
        this.registro.valor.estado = estado;
    }


}
