import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'rup-PartoCesarea',
  templateUrl: 'partoCesarea.html'
})

export class PartoCesareaComponent implements OnInit {

  //@Input('paciente') paciente: any;
     paciente: any; // será un IPaciente
    //@Input('tipoPrestacion') tipoPrestacion: any;
    tipoPrestacion: any;
    @Input('required') required: Boolean;
    @Input('datosIngreso') datosIngreso: any;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    data: any = {
        //valor: '',
        mensaje: {
            class: "",
            texto: ""
        },
    };

    ngOnInit() {
        this.paciente = {
            "id": "57ebacce69fe79a598e6281d",
            "documento": "29410428",
            "activo": true,
            "estado": "validado",
            "nombre": "Carolina",
            "apellido": "Celeste",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": "02/11/1993",
            "estadoCivil": "soltera"
        };
        this.tipoPrestacion = {
            "id": "58b6cd6eb64acd0989b9f537",
            "key": "scoreApgar",
            "nombre": "Score Apgar",
            "autonoma": true,
            "activo": true,
            "componente": {
                "ruta": "rup/scoreApgar.component.ts",
                "nombre": "scoreApgarComponent"
            },
            "turneable": false
        };
    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : false;
  }

  devolverValores() {
    this.data.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
  }

  getMensajes() { };

}