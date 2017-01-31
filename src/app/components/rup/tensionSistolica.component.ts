import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'tensionSistolica',
    templateUrl: 'tensionSistolica.html'
})
export class TensionSistolicaComponent{

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() sistolica: EventEmitter<any> = new EventEmitter<any>();

    tensionSistolica: Number = null;
    mensaje: String = null;


    ngOnInit() {
    }

    devolverValores(){
        this.sistolica.emit(this.tensionSistolica);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }

}