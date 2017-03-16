import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-PartoViaVaginalForceps',
  templateUrl: 'partoViaVaginalForceps.html'
})

export class PartoViaVaginalForcepsComponent implements OnInit {


  @Input('paciente') paciente: any;
  @Input('tipoPrestacion') tipoPrestacion: any;
  @Input('required') required: Boolean;
  @Input('datosIngreso') datosIngreso: any;
  @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

  data: any = {
    mensaje: {
      class: "",
      texto: "",
    },
  };

  ngOnInit() {
    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;
  }

  devolverValores() {
    this.data.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
  }

  getMensajes() { };

}