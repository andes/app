import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";

@Component({
    selector: 'rup-ViviendaCombustion',
    templateUrl: 'viviendaCombustion.html'
})

export class ViviendaCombustionComponent extends Atomo {            
    public SelectCombustion: Array<Object> = [{ id: 'Gas Natural', nombre: 'Gas Natural' },
    { id: 'Garrafa', nombre: 'Garrafa' },
    { id: 'Leña/Carbon', nombre: 'Leña/Carbon' },
    { id: 'Kerosén', nombre: 'Kerosén' },
    { id: 'Electricidad', nombre: 'Electricidad' },
    { id: 'Otro ', nombre: 'Otro ' },
    ]; 
}