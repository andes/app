import { Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { IPrestacionRegistro } from '../../../../interfaces/prestacion.registro.interface';
import { IElementoRUP } from '../../../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from '../../../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-plan-indicacion',
    templateUrl: 'planDeIndicacion.html',
    styleUrls: ['planDeIndicacion.scss']
})
@RupElement('PlanIndicacionComponent')
export class PlanIndicacionComponent extends RUPComponent implements OnInit {

    rupElemento: IElementoRUP;
    conceptoSnomed: ISnomedConcept;
    registroNuevo: IPrestacionRegistro;
    ngOnInit() {

        this.rupElemento = this.elementoRUP.requeridos[0].elementoRUP;
        this.conceptoSnomed = this.registro.registros[0].concepto;
        if (!this.registro.registros[0].valor) {
            this.registro.registros[0].valor = { estado: 'activo' };
        }
    }

    agregarRegistro() {
        this.registroNuevo = new IPrestacionRegistro(this.rupElemento, this.conceptoSnomed);
        this.registroNuevo.valor = { estado: 'activo' };
        this.registro.registros = [...this.registro.registros, this.registroNuevo];
    }

    cambiaEstado(estado, index) {
        this.registro.registros[index].valor.estado = estado;
    }



    quitarIndicacion(index) {
        this.registro.registros.splice(index, 1);
    }


    modificar() {

    }

}
