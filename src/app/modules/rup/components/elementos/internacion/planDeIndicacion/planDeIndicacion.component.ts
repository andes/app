import { Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { IPrestacionRegistro } from '../../../../interfaces/prestacion.registro.interface';
import { IElementoRUP } from '../../../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from '../../../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-plan-indicacion',
    templateUrl: 'planDeIndicacion.html'
})
@RupElement('PlanIndicacionComponent')
export class PlanIndicacionComponent extends RUPComponent implements OnInit {

    rupElemento: IElementoRUP;
    conceptoSnomed: ISnomedConcept;
    registroNuevo: IPrestacionRegistro;

    ngOnInit() {
        this.rupElemento = this.elementoRUP.requeridos[0].elementoRUP;
        this.conceptoSnomed = this.registro.registros[0].concepto;
    }

    agregarRegistro() {
        this.registroNuevo = new IPrestacionRegistro(this.rupElemento, this.conceptoSnomed);
        this.registro.registros = [...this.registro.registros, this.registroNuevo];
    }

    cambiaEstado(estado, registro) {
        if (registro.registros.length) {
            registro.registros.forEach(reg => {
                reg.valor.estado = estado;
            });
        }
        console.log(estado, registro);
    }

}
