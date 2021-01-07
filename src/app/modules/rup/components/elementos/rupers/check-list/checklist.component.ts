import { Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { Observable, of } from 'rxjs';

/**
 * Parametros
 *
 * label: Titulo del componente
 * multiple: permite seleccionar unoi o varios items
 * query: queryt snomed para buscar los items
 * items: items a mano
 * required: valida si se eligio o no valor
 * watch: activa el ojop que todo lo ve
 *
 * idField: nombre del campo a usar como ID
 * labelField: nombre del campo a usar como label
 * type: orizontal o vertical
 */

@Component({
    selector: 'rup-check-list',
    templateUrl: 'checklist.html'
})
@RupElement('ChecklistComponent')
export class ChecklistComponent extends RUPComponent implements OnInit {

    data$: Observable<any[]>;

    valor: any;
    watch = false;


    multiple: boolean;
    required: boolean;
    label: string;
    type: string;
    idField: string;
    labelField: string;

    allowOtherQuery: string;
    otros = [];


    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }
        this.multiple = this.params.multiple || false;
        this.required = this.params.required || false;
        this.label = this.params.label || this.registro.concepto.term;
        this.idField = this.params.idField || 'id';
        this.labelField = this.params.labelField || 'label';
        this.type = this.params.type || 'horizontal';
        this.watch = this.params.watch || false;

        this.allowOtherQuery = this.params.allowOtherQuery || null;


        if (!this.registro.valor) {
            this.registro.valor = this.multiple ? [] : null;
        }

        if (this.multiple) {
            this.valor = this.registro.valor.filter(el => !el._o);
            this.otros = this.registro.valor.filter(el => el._o);
        } else {
            if (this.registro.valor?._o) {
                this.otros = this.registro.valor;
            } else {
                this.valor = this.registro.valor;
            }
        }

        if (this.params.query) {
            this.idField = 'conceptId';
            this.labelField = 'term';
            this.data$ = this.snomedService.getQuery({ expression: this.params.query });
        } else if (this.params.items) {
            this.data$ = of(this.params.items);
        }

        if (this.watch && !this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (data.valor) {
                    this.valor = data.valor;
                    this.registro.valor = data.valor;
                }
            });
        }
    }

    onValueChange(type: string, items: any[], valor) {

        if (this.multiple) {
            valor = valor || this.valor;

            const otros = (this.otros || []).map(el => { return { ...el, _o: true }; });

            this.registro.valor = [
                ...valor,
                ...otros
            ];

        } else {
            if (type === 'radio') {
                this.otros = null;
                this.registro.valor = items.find(item => item[this.idField] === valor);
            } else {
                this.valor = null;
                this.registro.valor = { ...this.otros, _o: true };
            }
        }
        this.addFact('value', this.registro.valor);
        this.emitChange();

    }

}
