import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../../interfaces/IPaciente';
@Component({
  selector: 'rup-ViviendaPiso',
  templateUrl: 'viviendaPiso.html'
})
export class ViviendaPisoComponent extends Atomo {
  public SelectPisos: Array<Object> = [{ id: 'Pisos de ladrillo', nombre: 'Pisos de ladrillo' },
  { id: 'Pisos de madera', nombre: 'Pisos de madera' },
  { id: 'Pisos cerámicos', nombre: 'Pisos cerámicos' },
  { id: 'Pisos de mármol', nombre: 'Pisos de mármol' },
  { id: 'Pisos de cemento y de hormigón', nombre: 'Pisos de cemento y de hormigón' },
  { id: 'Pisos mosaicos', nombre: 'Pisos mosaicos' },
  { id: 'Pisos de mármol y granito', nombre: 'Pisos de mármol y granito' },
  { id: 'Pisos de granitogres y de porcelanato', nombre: 'Pisos de granitogres y de porcelanato' },
  { id: 'Pisos de piedras y losetas', nombre: 'Pisos de piedras y losetas' },
  { id: 'Pisos flotantes', nombre: 'Pisos flotantes' },
  { id: 'Pisos en vinilos', nombre: 'Pisos en vinilos' },
  { id: 'Otros', nombre: 'Otros' },
  ];
}
