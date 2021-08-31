import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { RupElement } from '.';

@Component({
    selector: 'rup-desarrollo-psicomotor',
    templateUrl: 'desarrolloPsicomotor.html'
})
@RupElement('DesarrolloPsicomotorComponent')
export class DesarrolloPsicomotorComponent extends RUPComponent implements OnInit {
    conceptos: any[];
    seleccionados: any[];

    ngOnInit() {
        if (this.registro) {
            if (!this.registro.valor) {
                this.registro.valor = [];
            }

            this.conceptos = this.elementoRUP.requeridos.map(x => x.concepto);
            for (const i in this.conceptos) {
                const concepto = this.conceptos[i];
                const a = this.estaSeleccionado(concepto);
                this.registro.valor[i] = {};
                this.registro.valor[i] = a;
            }
        }
    }

    isEmpty() {
        const opciones = this.registro.valor || [];
        return opciones.every((v) => !v.checked);
    }

    private estaSeleccionado(concepto) {
        let checked = false;
        if (this.registro.valor && this.registro.valor.length) {
            checked = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === String(concepto.conceptId) && x.checked === true) >= 0; // Se busca el concepto dentro de los seleccionados
        }
        return { concepto: concepto, checked: checked };
    }

    loadConceptos($event) {
        const conceptosCheckBox = this.elementoRUP.requeridos.map(elem => {
            return { id: elem.concepto.conceptId, nombre: elem.concepto.term, concepto: elem.concepto };
        });
        $event.callback(conceptosCheckBox);
    }

    selectCheckBox(i) {
        const checked = !this.registro.valor[i].checked;
        for (const index in this.registro.valor) {
            this.registro.valor[index].checked = false;
        }
        this.registro.valor[i].checked = !checked;
    }

    tieneValor() {
        return this.registro.valor.find(x => x.checked === true);
    }
}
