import { Component } from '@angular/core';
import { RupElement } from '..';
import { SelectBaseComponent } from './select-base.component';
import { of } from 'rxjs';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 * items: Items staticos a seleccionar.
 *   - id: id del item.
 *   - label: campo a mostrar.
 */

@Component({
    selector: 'rup-select-items',
    templateUrl: './select-base.component.html'
})
@RupElement('SelectStaticoComponent')
export class SelectStaticoComponent extends SelectBaseComponent {

    public labelField = `label`;

    getData(input: string) {
        return of(this.params.items);
    }

    displayName(item) {
        return item.label;
    }

}
