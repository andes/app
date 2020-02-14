import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RupElement } from '../index';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { SelectBaseComponent } from './select-base.component';

/**
 * ATENCION: Debido al dependecy inyection de Angular no se pudo crear una componente Select de base.
 */

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 */

@Component({
    selector: 'rup-select-organizacion',
    templateUrl: './select-base.component.html'
})
@RupElement('SelectOrganizacionComponent')
export class SelectOrganizacionComponent extends SelectBaseComponent {

    public labelField = 'nombre';

    public idField = 'id';

    getData(input: string) {
        const query = {
            nombre: input,
            fields: 'nombre'
        };
        return this.servicioOrganizacion.get(query);
    }

}
