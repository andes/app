import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaSituacionSocioEc',
    templateUrl: 'viviendaSituacionSocioEc.html'
})//@Component

export class ViviendaSituacionSocioEcComponent implements OnInit {

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



    // Esta lista se deberá cargar en algún schema...(Ver más adelante)                          
    public SelectFamiliar: Array<Object> = [{ id: 'Hermano/a', nombre: 'Hermano/a' },
    { id: 'Madre', nombre: 'Madre' },
    { id: 'Padre', nombre: 'Padre' },
    { id: 'Abuelo/a Materno', nombre: 'Abuelo/a Materno' },
    { id: 'Abuelo/a Paterno', nombre: 'Abuelo/a Paterno' },

    ]; //tipoPisos:Array

    ngOnInit() {

        this.tipoPrestacion = {
            "id": "58b986feb64acd0989b9f53f",
            "key": "viviendaSituacionSocioEc",
            "nombre": "Situación Socioeconómica del Familiar",
            "autonoma": false,
            "activo": true,
            "ejecucion" : [ 
        "58b6d618b64acd0989b9f538", 
        "58b8183bb64acd0989b9f53d", 
        "58b8278bb64acd0989b9f53e"
    ],
            "componente": {
                "ruta": "rup/viviendaSituacionSocioEc.component.ts",
                "nombre": "ViviendaSituacionSocioEcComponent"
            },
            "turneable": false
        }

        // como es una molécula buscamos sus atomos
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
            console.log(this.tipoPrestacion);
        });



        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : { familiar: null, };
    } //ngOnInit()

    devolverValores() { //Hacer las validaciones                                                     
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() {
    };


     onReturnComponent(obj: any, tipoPrestacion: any) {
        console.log(obj);
        console.log(tipoPrestacion);
        // inicializamos el array donde vamos a guardar todos los datos del form
        // if (this.data[this.tipoPrestacion.key] === undefined) {
        //     this.data[this.tipoPrestacion.key] = {};
        // }

        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];
        // this.data.mensaje.texto = this.mensaje;
        // console.log(this.data);
        this.evtData.emit(this.data);
    }
    

}//export class SituacionSocioEc