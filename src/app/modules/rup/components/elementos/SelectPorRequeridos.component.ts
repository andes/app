import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { RupElement } from '.';

@Component({
    selector: 'rup-select-por-requeridos',
    templateUrl: 'SelectPorRequeridos.html'
})
@RupElement('SelectPorRequeridosComponent')
export class SelectPorRequeridosComponent extends RUPComponent implements OnInit {
    public conceptos: any[];
    seleccionados: any[];
    public unique: number = new Date().getTime();
    conceptoSelect = new Array();

    ngOnInit() {

        if (this.registro) {
            if (!this.registro.valor) {
                this.registro.valor = [];
            }

            if (!this.soloValores) {

                this.conceptObserverService.observe(this.registro).subscribe((data) => {
                    if (this.registro !== data && this.registro.valor !== data.valor) {
                        this.registro.valor = data.valor;
                    }
                });
            }

            this.conceptos = this.elementoRUP.requeridos.map(x => x.concepto);
            this.conceptoSelect = this.conceptos.map(x => {
                return {
                    id: x.conceptId,
                    nombre: x.term,
                    concepto: x,
                };
            });
        }
        if (!this.registro.valor) {
            this.registro.valor = [];
        }
    }


    loadConceptos($event) {
       // console.log(this.elementoRUP.requeridos);
        let conceptosSelect = this.elementoRUP.requeridos.map(elem => {
            return { id: elem.concepto.conceptId, nombre: elem.concepto.term, concepto: elem.concepto };
        });
        $event.callback(conceptosSelect);
    }

    selectRadio(concepto) {
        this.registro.valor = { concepto: concepto };
    }

}
