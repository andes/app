import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RupElement } from '..';
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
    selector: 'rup-select-profesionales',
    templateUrl: './select-base.component.html'
})
@RupElement('SelectProfesionalComponent')
export class SelectProfesionalComponent extends SelectBaseComponent {

    public idField = 'id';


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
