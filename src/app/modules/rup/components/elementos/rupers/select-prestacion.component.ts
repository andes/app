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
 * presmisos: string shiro de donde buscar las prestaciones con permisos
 */

@Component({
    selector: 'rup-select-prestaciones',
    templateUrl: './select-base.component.html'
})
@RupElement('SelectPrestacionComponent')
export class SelectPrestacionComponent extends SelectBaseComponent {

    public idField = 'id';

    public labelField = 'term';


    getData(input: string) {
        const permisos = this.params.permisos || undefined;
        let term = undefined;
        if (input && input.length > 0) {
            term = `^${input}`;
        }
        return this.conceptosTurneablesService.search({ permisos, term });

    }

    displayName(item) {
        return item.term;
    }

}
