import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-edadGestacional',
    templateUrl: 'edadGestacional.html'
})
export class EdadGestacionalComponent implements OnInit {
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

        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };
        if (this.data[this.tipoPrestacion.key]) {
            switch (true) {
                //Validaciones con los mensajes.
                case (this.data[this.tipoPrestacion.key] >= 42):
                    mensaje.texto = "Postmaduro";
                    mensaje.class = "outline-danger";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 37 && this.data.valor <= 41):
                    mensaje.texto = "A termino";
                    mensaje.class = "outline-succes";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 35 && this.data.valor <= 36):
                    mensaje.texto = "Prematuro Leve";
                    mensaje.class = "outline-warning";
                    break;
                case (this.data[this.tipoPrestacion.key] >= 32 && this.data.valor <= 34):
                    mensaje.texto = "Prematuro moderado";
                    mensaje.class = "outline-danger";
                    break;
                case (this.data[this.tipoPrestacion.key] < 32):
                    mensaje.texto = "Prematuro extremo";
                    mensaje.class = "outline-danger";
                    break;
            }
        }
        return mensaje;
    }
}