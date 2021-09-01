import { SemanticTag } from './../../../interfaces/semantic-tag.type';
import { Component } from '@angular/core';
import { RupElement } from '..';
import { SelectBaseComponent } from './select-base.component';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 * query: expression snomed a buscar
 */

@Component({
    selector: 'rup-select-snomed',
    templateUrl: './select-base.component.html'
})
@RupElement('SelectSnomedComponent')
export class SelectSnomedComponent extends SelectBaseComponent {

    public idField = 'conceptId';

    public labelField = 'term';

    getData(input: string) {
        const query: any = {
            expression: this.params.query
        };
        if (this.params.preload) {
            query.search = '';
        } else {
            query.search = input;
        }
        if (this.params.semanticTag) {
            query.semanticTag = this.params.semanticTag;
        }
        return this.snomedService.get(query);
    }

    displayName(item) {
        return item.term;
    }

}
