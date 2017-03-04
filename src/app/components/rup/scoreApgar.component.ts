import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-scoreApgar',
    templateUrl: 'scoreApgar.html'
})
export class ScoreApgarComponent implements OnInit {
    @Input('paciente') paciente: any;
    //paciente: any; // será un IPaciente
    @Input('tipoPrestacion') tipoPrestacion: any;
    //tipoPrestacion: any;
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
        // this.paciente = {
        //     "id": "57ebacce69fe79a598e6281d",
        //     "documento": "29410428",
        //     "activo": true,
        //     "estado": "validado",
        //     "nombre": "Carolina",
        //     "apellido": "Celeste",
        //     "sexo": "femenino",
        //     "genero": "femenino",
        //     "fechaNacimiento": "02/11/1993",
        //     "estadoCivil": "soltera"
        // };
        // this.tipoPrestacion = {
        //     "_id": "58b6cd6eb64acd0989b9f537",
        //     "key": "scoreApgar",
        //     "nombre": "Score Apgar",
        //     "autonoma": true,
        //     "activo": true,
        //     "componente": {
        //         "ruta": "rup/scoreApgar.component.ts",
        //         "nombre": "scoreApgarComponent"
        //     },
        //     "turneable": false
        // };
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            minutos: null
        };

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
            //Validaciones con los mensajes.
            if (this.data[this.tipoPrestacion.key] >= 7 && this.data[this.tipoPrestacion.key] <= 10) {
                mensaje.texto = "Excelente";
                mensaje.class = "outline-succes";
            }
            if (this.data[this.tipoPrestacion.key] >= 4 && this.data[this.tipoPrestacion.key] <= 6) {
                mensaje.texto = "Moderadamente Deprimido";
                mensaje.class = "outline-warning";
            }
            if (this.data[this.tipoPrestacion.key] >= 0 && this.data[this.tipoPrestacion.key] <= 3) {
                mensaje.texto = "Severamente Deprimido";
                mensaje.class = "outline-danger";
            }
        }
        return mensaje;
    }
}