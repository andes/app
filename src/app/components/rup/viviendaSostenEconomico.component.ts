import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaSostenEconomico',
    templateUrl: 'viviendaSostenEconomico.html'
})//@Component

export class ViviendaSostenEconomicoComponent implements OnInit {

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
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : { trabaja: false, horas: null };
    } //ngOnInit()

    devolverValores() { //Hacer las validaciones                                                     
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() {
    };

}//export class ViviendaSostenEconomicoComponent