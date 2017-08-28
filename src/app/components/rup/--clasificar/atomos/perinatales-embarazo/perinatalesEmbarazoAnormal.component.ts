import { Atomo } from './../../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../../interfaces/IPaciente';

@Component({
  selector: 'rup-PerinatalesEmbarazoAnormal',
  templateUrl: 'perinatalesEmbarazoAnormal.html'
})// @Component

export class PerinatalesEmbarazoAnormalComponent extends Atomo {

  // @Input('datosIngreso') datosIngreso: any;
  // @Input('tipoPrestacion') tipoPrestacion: any;
  // @Input('paciente') paciente: IPaciente;
  // @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

  // data: any = {
  //   mensaje: {
  //     class: "",
  //     texto: "",
  //   },
  // };

  // ngOnInit() {
  //   this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : false;
  // } //ngOnInit()

  // devolverValores() { //Hacer las validaciones
  //   this.data.mensaje = this.getMensajes();
  //   this.evtData.emit(this.data);
  // }//devolverValores()

  // getMensajes() { };

}
