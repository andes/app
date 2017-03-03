import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-viviendaNivelInstruccion',
    templateUrl: 'viviendaNivelInstruccion.html'
})//@Component

export class ViviendaNivelInstruccionComponent implements OnInit {

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
            "_id": "58b8278bb64acd0989b9f53e",
            "key": "viviendaNivelInstruccion",
            "nombre": "Nivel de Instrucción",
            "autonoma": false,
            "activo": true,
            "componente": {
                "ruta": "rup/viviendaNivelInstruccion.component.ts",
                "nombre": "ViviendaNivelInstruccionComponent"
            },
            "turneable": false
        }


        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso :{primario:false, secundario:false, terciario:false};


    } //ngOnInit()


    devolverValores(event,texto) { //Hacer las validaciones  
        debugger;                                              
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() { };

}//export class ViviendaNivelInstruccionComponent