import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";

@Component({
    selector: 'rup-ControlDeEsfinteres',
    templateUrl: 'controlDeEsfinteres.html'
})
export class ControlDeEsfinteresComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    // @Input('tipoPrestacion') tipoPrestacion: any;
    // @Input('paciente') paciente: IPaciente;
    paciente: any;
    tipoPrestacion:any;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {
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
            "_id": "58b6b6b2b64acd0989b9f536",
            "key": "edadGestacional",
            "nombre": "Edad gestacional",
            "autonoma": true,
            "activo": true,
            "componente": {
                "ruta": "rup/edadGestacional.component.ts",
                "nombre": "edadGestacionalComponent"
            },
            "turneable": false
        };
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
    }

    devolverValores() {
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }

    getMensajes() {


    }
}