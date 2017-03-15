import { EscalaDeDesarrolloComponent } from './escalaDeDesarrollo.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-EscalaDeDesarrollo',
    templateUrl: 'escalaDeDesarrollo.html'
})
export class EscalaDeDesarrolloComponent implements OnInit {

    //@Input('paciente') paciente: any;
    paciente: any; // será un IPaciente
    //@Input('tipoPrestacion') tipoPrestacion: any;
    tipoPrestacion: any;
    @Input('required') required: Boolean;
    @Input('datosIngreso') datosIngreso: any;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    // resultados a devolver
    data: any = {
        mensaje: {
            texto: '',
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
            "id": "58b70110b64acd0989b9f53c",
            "key": "EscalaDeDesarrollo",
            "nombre": "Escala de desarrollo",
            "autonoma": false,
            "activo": true,
            "ejecucion": [
               "5890c93f7358af394f6d52d9",
                "5890c94d7358af394f6d52da",
                "58b6cd6eb64acd0989b9f537",
                "58b6b6b2b64acd0989b9f536",
                "58be954fa99b5e0646e8f430"
            ],
            "componente": {
                "ruta": "rup/moleculas/escala-de-desarrollo/escalaDeDesarrollo.component.ts",
                "nombre": "EscalaDeDesarrolloComponent"
            },
            "turneable": false
        }
        // como es una molécula buscamos sus atomos
        // this.tipoPrestacion.id
        this.servicioTipoPrestacion.getById("58b70110b64acd0989b9f53c").subscribe(tipoPrestacion => {
           
            this.tipoPrestacion = tipoPrestacion;
        });
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};


    }

    onReturnComponent(obj: any, tipoPrestacion: any) {
        this.data.mensaje = this.getMensajes();
        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

        this.evtData.emit(this.data);
    }

    getMensajes() {

        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };
        return mensaje;
    }
}