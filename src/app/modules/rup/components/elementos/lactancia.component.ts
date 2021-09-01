import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-lactancia',
    templateUrl: 'lactancia.html',
})
@RupElement('LactanciaComponent')
export class LactanciaComponent extends RUPComponent implements OnInit {
    public conceptos: any[] = [];

    ngOnInit() {
        if (this.registro) {
            if (!this.registro.valor) {
                this.registro.valor = [];
            }

            if (this.params) {
                this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                    this.conceptos = resultado;
                    if (!this.registro.valor.length) { // La primera vez, siempre crea los registro.valor por cada concepto y ser utilizado en el html por el (ngModel)
                        for (const i in this.conceptos) {
                            const concepto = this.conceptos[i];
                            const a = this.estaSeleccionado(concepto);
                            this.registro.valor[i] = {};
                            this.registro.valor[i] = a;
                        }
                    }
                });
            }
        }
    }

    isEmpty() {
        const opciones = this.registro.valor || [];
        const isEmpty = opciones.every((v) => !v.checkbox);
        return isEmpty;
    }

    private estaSeleccionado(concepto) { // Se genera el arreglo de un registro de lactancia
        let checkbox = false;
        if (this.registro.valor.length) {
            checkbox = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === String(concepto.conceptId)) >= 0; // Se busca el concepto dentro de los seleccionados
        }
        return { concepto: concepto, checkbox: checkbox };
    }

    loadConceptos($event) {
        const conceptosCheckBox = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(conceptosCheckBox);
    }

    selectCheckBox(concepto) {
        const grupos = this.params.grupo;
        for (const k in grupos) {
            if (!grupos[k].includes(concepto.conceptId)) { // Si no pertenece al grupo de seleccion, cambiamos el valor del check a false
                for (const val in grupos[k]) {
                    const indexRegistro = this.registro.valor.findIndex(x => String(x.concepto.conceptId) === grupos[k][val]); // Obtenemos el index del registro
                    if (this.registro.valor[indexRegistro].checkbox) {
                        this.registro.valor[indexRegistro].checkbox = false;
                    }
                }
            }
        }
    }

    tieneValor() {
        return this.registro.valor.find(x => x.checkbox === true);
    }
}
