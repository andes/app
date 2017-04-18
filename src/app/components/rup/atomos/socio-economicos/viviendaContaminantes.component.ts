import { Atomo } from './../atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";
@Component({
      selector: 'rup-ViviendaContaminantes',
      templateUrl: 'viviendaContaminantes.html'
})
export class ViviendaContaminantesComponent extends Atomo {        
      public SelectContaminantes: Array<Object> = [{ id: 'Humo', nombre: 'Humo' },
      { id: 'Basurales', nombre: 'Basurales' },
      { id: 'Agroquímicos', nombre: 'Agroquímicos' },
      { id: 'Vectores', nombre: 'Vectores' },
      { id: 'Terrenos', nombre: 'Terrenos' },
      { id: 'Inundables', nombre: 'Inundables' },
      { id: 'Petroquímica', nombre: 'Petroquímica' },
      ]; 
}