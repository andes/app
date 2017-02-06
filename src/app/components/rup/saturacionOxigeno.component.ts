import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
export class SaturacionOxigenoComponent {

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    saturacionOxigeno: Number = null;
    mensaje: String = null;

    ngOnInit() {
    }

    devolverValores() {
        this.evtData.emit(this.saturacionOxigeno);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }

}