import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';

@Component({
    selector: 'rup-edadGestacionalFetal',
    templateUrl: 'edadGestacionalFetal.html'
})
export class EdadGestacionalFetalComponent implements OnInit {
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

    showCampoFecha: Boolean = false;

    public selectMetodoEdadGestacionalFetal: Array<Object> = [
        { id: 'Examen físico', nombre: 'Examen físico' },
        { id: 'Fecha ultima menstruación', nombre: 'Fecha ultima menstruación' },
    ];
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
        //     "id": "58b6b6b2b64acd0989b9f536",
        //     "key": "edadGestacionalFetal",
        //     "nombre": "Edad gestacional Fetal",
        //     "autonoma": true,
        //     "activo": true,
        //     "componente": {
        //         "ruta": "rup/edadGestacionalFetal/edadGestacionalFetal.component.ts",
        //         "nombre": "edadGestacionalFetalComponent"
        //     },
        //     "turneable": false
        // };
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            fecha: null
        };

    }

    devolverValores() {
        this.data.mensaje = this.getMensajes();
        if (this.data[this.tipoPrestacion.key].nombre == 'Fecha ultima menstruación') {
            this.showCampoFecha = true;
        }
        else {
            this.showCampoFecha = false;
            this.data[this.tipoPrestacion.key].fecha = null;
        }
        this.evtData.emit(this.data);
    }


    getMensajes() {


    }
}