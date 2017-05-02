import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";
@Component({
    selector: 'rup-ViviendaFamilia',
    templateUrl: 'viviendaFamilia.html'
})
export class ViviendaFamiliaComponent extends Atomo {             
    public SelectFamiliar: Array<Object> = [
        { id: 'Hermana', nombre: 'Hermana' },
        { id: 'Hermano', nombre: 'Hermano' },
        { id: 'Madre', nombre: 'Madre' },
        { id: 'Padre', nombre: 'Padre' },
        { id: 'Abuela Materna', nombre: 'Abuela Materna' },
        { id: 'Abuelo Materno', nombre: 'Abuelo Materno' },
        { id: 'Abuela Paterna', nombre: 'Abuela Paterna' },
        { id: 'Abuelo Paterno', nombre: 'Abuelo Paterno' },
    ];
}
