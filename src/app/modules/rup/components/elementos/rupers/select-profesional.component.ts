import { Component } from '@angular/core';
import { RupElement } from '..';
import { SelectBaseComponent } from './select-base.component';

@Component({
    selector: 'rup-select-profesionales',
    templateUrl: './select-base-component.html'
})
@RupElement('SelectProfesionalComponent')
export class SelectProfesionalComponent extends SelectBaseComponent {

    public labelField = `apellido + ' ' + nombre`;

    getData(input: string) {
        let query = {
            nombreCompleto: input
        };
        return this.serviceProfesional.get(query);

    }

    displayName(item) {
        return item.apellido + ' ' + item.nombre;
    }
}
