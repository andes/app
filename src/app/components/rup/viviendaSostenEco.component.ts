import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaSostenEco',
    templateUrl: 'viviendaSostenEco.html'
})//@Component

export class ViviendaSostenEcoComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {
        mensaje: {
            class: "",
            texto: "",
        },
    };


    ngOnInit() {

        this.tipoPrestacion = {
            "_id": "58b6d618b64acd0989b9f538",
            "key": "viviendaSostenEco",
            "nombre": "Sostén Económico",
            "autonoma": false,
            "activo": true,
            "componente": {
                "ruta": "rup/viviendaSostenEco.component.ts",
                "nombre": "ViviendaSostenEcoComponent"
            },
            "turneable": false
        }



        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : { trabaja: false, horas: null };
    } //ngOnInit()

    devolverValores() { //Hacer las validaciones                                                     
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() {
    };

}//export class ViviendaSostenEcoComponent