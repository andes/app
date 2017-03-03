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

    data: any = {
        mensaje: {
            class: "",
            texto: "",
        },
    };


    ngOnInit() {

        this.tipoPrestacion = {}



        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso :null;
    } //ngOnInit()

    devolverValores() { //Hacer las validaciones                                                     
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() {
    };

}//export class SituacionSocioEc