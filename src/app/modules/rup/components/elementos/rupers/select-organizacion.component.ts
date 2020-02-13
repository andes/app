import { Component, OnInit } from '@angular/core';
import { RupElement } from '../index';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { IOrganizacion } from '../../../../../interfaces/IOrganizacion';
import { SelectBaseComponent } from './select-base.component';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 */

@Component({
    selector: 'rup-select-organizacion',
    templateUrl: './select-base-component.html'
})
@RupElement('SelectOrganizacionComponent')
export class SelectOrganizacionComponent extends SelectBaseComponent {

    getData(input: string) {
        let query = {
            nombre: input,
            fields: 'nombre'
        };
        return this.servicioOrganizacion.get(query);

    }
}
