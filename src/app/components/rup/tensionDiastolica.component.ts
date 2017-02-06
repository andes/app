import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-tension-diastolica',
    templateUrl: 'tensionDiastolica.html'
})
export class TensionDiastolicaComponent {
    @Input('paciente') paciente: IPaciente;
    @Input('tipoPrestacion') prestacion: any;
    @Input('required') required: Boolean;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    tensionDiastolica: Number = null;
    mensaje: String = null;

    devolverValores(){
        this.evtData.emit(this.tensionDiastolica);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }


}