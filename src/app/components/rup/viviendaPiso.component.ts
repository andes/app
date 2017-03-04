import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-ViviendaPiso',
  templateUrl: 'viviendaPiso.html'
})//@Component

export class ViviendaPisoComponent implements OnInit {

  @Input('datosIngreso') datosIngreso: any;
  @Input('tipoPrestacion') tipoPrestacion: any;
  @Input('paciente') paciente: IPaciente;
  @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

  data: any = {
    mensaje: {
      class: "",
      texto: "",
    },
  };

  // Esta lista se deberá cargar en algún schema...(Ver más adelante)                          
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
  ]; //tipoPisos:Array

  ngOnInit() {
    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
  }//ngOnInit()

  devolverValores() { //Hacer las validaciones                   
    this.data.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
  }//devolverValores()

  getMensajes() { }

}//export class ViviendaPisoComponent
