import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-etapa-pubertad',
    templateUrl: 'EtapaPubertad.html'
})
@RupElement('EtapaPubertadComponent')
export class EtapaPubertadComponent extends RUPComponent implements OnInit {
    conceptos: any[];
    seleccionados: any[];
    elmConceptos: any[];
    sexo: any;
    ngOnInit() {
        if (this.registro) {
            if (!this.registro.valor) {
                this.registro.valor = [];
            }
            this.sexo = this.paciente.sexo;

            this.conceptos = this.elementoRUP.requeridos.map(x => x.concepto);

            for (let i in this.conceptos) {
                let concepto = this.conceptos[i];
                let a = this.estaSeleccionado(concepto);
                this.registro.valor[i] = a;
            }
        }

    }
    private estaSeleccionado(concepto) {
        let checked = false;
        if (this.registro.valor && this.registro.valor.length) {
            checked = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === String(concepto.conceptId) && x.checked === true) >= 0; // Se busca el concepto dentro de los seleccionados
        }
        return { concepto: concepto, checked: checked };
    }

    loadConceptos($event) {
        let conceptosCheckBox = this.elementoRUP.requeridos.map(elem => {
            return { id: elem.concepto.conceptId, nombre: elem.concepto.term, concepto: elem.concepto };
        });
        $event.callback(conceptosCheckBox);
    }

    selectCheckBox(i) {
        const checked = !this.registro.valor[i].checked;
        for (let index in this.registro.valor) {
            this.registro.valor[index].checked = false;
        }
        this.registro.valor[i].checked = !checked;
    }

    tieneValor() {
        return this.registro.valor.find(x => x.checked === true);
    }
}
