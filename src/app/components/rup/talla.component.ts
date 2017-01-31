import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'talla',
    templateUrl: 'talla.html'
})
export class TemperaturaComponent {
    @Input('paciente') paciente: IPaciente;
    @Input('tipoPrestacion') prestacion: any;
    @Input('required') required: Boolean;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    talla: Number = null;
    mensaje: String = null;

    devolverValores() {
        this.evtData.emit(this.talla);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.temperatura > 10){
        // }
    }


}