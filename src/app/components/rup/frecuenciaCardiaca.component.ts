import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'frecuenciaCardiaca',
    templateUrl: 'frecuenciaCardiaca.html'
})
export class FrecuenciaCardiacaComponent{

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    frecuenciaCardiaca: Number = null;
    mensaje: String = null;


    ngOnInit() {
    }

    devolverValores(){
        this.evtData.emit(this.frecuenciaCardiaca);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.frecuenciaRespiratoria > 10){
        // }
    }

}