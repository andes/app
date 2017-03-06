import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-PerinatalesEmbarazoNormal',
  templateUrl: 'PerinatalesEmbarazoNormal.html'
})//@Component

export class PerinatalesEmbarazoNormalComponent implements OnInit {

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

this.tipoPrestacion={
    "id" : "58bd9f33a99b5e0646e8f42f",
    "key" : "perinatalesEmbarazoNormal",
    "nombre" : "Perinatales - Embarazo Normal",
    "autonoma" : false,
    "activo" : true,
    "componente" : {
        "ruta" : "rup/perinatalesEmbarazoNormal.component.ts",
        "nombre" : "perinatalesEmbarazoNormalComponent"
    },
    "turneable" : false
}


    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;
  } //ngOnInit()

  devolverValores() { //Hacer las validaciones                                              
    this.data.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
  }//devolverValores()

  getMensajes() { };

}//export class PerinatalesEmbarazoNormalComponent