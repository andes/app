import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';

@Component({
    selector: 'rup-partoViaVaginal',
    templateUrl: 'partoViaVaginal.html'
})
export class PartoViaVaginalComponent implements OnInit {
    @Input('paciente') paciente: any;
    //paciente: any; // será un IPaciente
    @Input('tipoPrestacion') tipoPrestacion: any;
    //tipoPrestacion: any;
    @Input('required') required: Boolean;
    @Input('datosIngreso') datosIngreso: any;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    data: any = {
        mensaje: {
            class: "",
            texto: ""
        },
    };

    public selectPartoViaVaginal: Array<Object> = [
        { id: 'Parto vaginal asistido con extractor de vacio', nombre: 'Parto vaginal asistido con extractor de vacio' },
        { id: 'Parto Vaginal con fórceps y cuidados postparto', nombre: 'Parto Vaginal con fórceps y cuidados postparto' },
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
        //     "key": "partoViaVaginal",
        //     "nombre": "parto via vaginal",
        //     "autonoma": true,
        //     "activo": true,
        //     "componente": {
        //         "ruta": "rup/partoViaVaginal.component.ts",
        //         "nombre": "PartoViaVaginalComponent"
        //     },
        //     "turneable": false
        // };
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            detalle: ""
        };

    }

    devolverValores() {
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }


    getMensajes() {


    }
}