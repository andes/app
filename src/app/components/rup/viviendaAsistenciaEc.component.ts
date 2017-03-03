import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-ViviendaAsistenciaEc',
  templateUrl: 'viviendaAsistenciaEc.html'
})//@Component

export class ViviendaAsistenciaEcComponent implements OnInit {

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


  ngOnInit() {



this.tipoPrestacion = {
    "_id" : "58b8183bb64acd0989b9f53d",
    "key" : "viviendaAsistenciaEc",
    "nombre" : "Asistencia Económica",
    "autonoma" : false,
    "activo" : true,
    "componente" : {
        "ruta" : "rup/viviendaAsistenciaEc.component.ts",
        "nombre" : "ViviendaAsistenciaEcComponent"
    },
    "turneable" : false
}



    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;
  } //ngOnInit()

  devolverValores() { //Hacer las validaciones  
    debugger;                                             
    this.data.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
  }//devolverValores()

  getMensajes() { };

}//export class ViviendaAsistenciaEcComponent