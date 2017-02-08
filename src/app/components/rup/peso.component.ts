import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-peso',
    templateUrl: 'peso.html'
})
export class PesoComponent {

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    peso: Number = null;
    mensaje: String = null;

    ngOnInit() {
    }

    devolverValores() {
        this.evtData.emit(this.peso);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }

}