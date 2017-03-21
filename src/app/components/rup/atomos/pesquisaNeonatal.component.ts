import { IPaciente } from '../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-PesquisaNeonatal',
  templateUrl: 'pesquisaNeonatal.html'
})

export class PesquisaNeonatalComponent implements OnInit {



  @Input('paciente') paciente: any;
  @Input('tipoPrestacion') tipoPrestacion: any;
  @Input('required') required: Boolean;
  @Input('datosIngreso') datosIngreso: any;
  @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

  data: any = {
    mensaje: {
      class: '',
      texto: '',
    },
  };

  ngOnInit() {
    // this.paciente = {
    //   "id": "57ebacce69fe79a598e6281d",
    //   "documento": "29410428",
    //   "activo": true,
    //   "estado": "validado",
    //   "nombre": "Carolina",
    //   "apellido": "Celeste",
    //   "sexo": "femenino",
    //   "genero": "femenino",
    //   "fechaNacimiento": "02/11/1993",
    //   "estadoCivil": "soltera"
    // };
    // this.tipoPrestacion = {
    //   "id": "58b6b6b2b64acd0989b9f536",
    //   "key": "partoViaVaginal",
    //   "nombre": "pesquisaneonatal",
    //   "autonoma": true,
    //   "activo": true,
    //   "componente": {
    //     "ruta": "rup/partoViaVaginal.component.ts",
    //     "nombre": "PartoViaVaginalComponent"
    //   },
    //   "turneable": false
    // };
    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;
  }

  devolverValores() {
    if (this.data[this.tipoPrestacion.key]) {
      this.data.mensaje = this.getMensajes();
      this.evtData.emit(this.data);
    }
  }

  getMensajes() {
    let mensaje: any = {
      texto: '',
      class: 'outline-danger'
    };
    if (this.data[this.tipoPrestacion.key] == false) {
      mensaje.texto = 'Alarma' //Ver el texto.
    }
    return mensaje;
  }

}