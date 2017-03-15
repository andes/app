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
              "_id" : "58c95603fa1a9819e86e68b0",
    "key" : "escalaDeDesarrollo",
    "nombre" : "Escala De Desarrollo",
    "autonoma" : false,
    "activo" : true,
    "granularidad" : "moleculas",
    "turneable" : false,
    "componente" : {
        "ruta" : "rup/moleculas/escala-de-desarrollo/escalaDeDesarrollo.component.ts",
        "nombre" : "EscalaDeDesarrolloComponent"
    },
    "ejecucion" : [ 
        "58c9492afa1a9819e86e68ac", 
        "58c94ac7fa1a9819e86e68ae", 
        "58c94b03fa1a9819e86e68af", 
        "58c94aa6fa1a9819e86e68ad"
    ],
    "solicitud" : [],
    "codigo" : [],
    "__v" : 0
        }
        // como es una molécula buscamos sus atomos
        // this.tipoPrestacion.id
        this.servicioTipoPrestacion.getById("58c95603fa1a9819e86e68b0").subscribe(tipoPrestacion => {
           
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