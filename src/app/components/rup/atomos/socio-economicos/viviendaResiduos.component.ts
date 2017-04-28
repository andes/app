import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";

@Component({
    selector: 'rup-ViviendaResiduos',
    templateUrl: 'viviendaResiduos.html'
})

export class ViviendaResiduosComponent extends Atomo {
    public SelectResiduos: Array<Object> = [{ id: 'Recolección', nombre: 'Recolección' },
    { id: 'Entierran', nombre: 'Entierran' },
    { id: 'Queman', nombre: 'Queman' },
    { id: 'Otra', nombre: 'Otra' },
    ];
}