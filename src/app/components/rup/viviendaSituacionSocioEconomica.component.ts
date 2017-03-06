import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';


@Component({
    selector: 'rup-ViviendaSituacionSocioEconomica',
    templateUrl: 'viviendaSituacionSocioEconomica.html'
})//@Component

export class ViviendaSituacionSocioEconomicaComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    data: any = {
        mensaje: {
            class: "",
            texto: "",
        },
    };


    ngOnInit() {

            this.tipoPrestacion={
    "id" : "58b986feb64acd0989b9f53f",
    "key" : "viviendaSituacionSocioEconomica",
    "nombre" : "Situación Socioeconómica del Familiar",
    "autonoma" : false,
    "activo" : true,
    "ejecucion" : [ 
        "58bd644ea99b5e0646e8f42e", 
        "58b8278bb64acd0989b9f53e", 
        "58b6d618b64acd0989b9f538", 
        "58b8183bb64acd0989b9f53d"
    ],
    "componente" : {
        "ruta" : "rup/viviendaSituacionSocioEconomica.component.ts",
        "nombre" : "ViviendaSituacionSocioEconomicaComponent"
    },
    "turneable" : false
}

        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });

        // si vienen datos por input, los asignamos a nuestro objeto data
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    } //ngOnInit()



    onReturnComponent(obj: any, tipoPrestacion: any) {        
        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];
        this.evtData.emit(this.data);
    } // onReturnComponent

    getMensajes() {
    };

}//export class ViviendaSituacionSocioEconomicaComponent