import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-frecuencia-respiratoria',
    templateUrl: 'frecuenciaRespiratoria.html'
})
export class FrecuenciaRespiratoriaComponent{

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    frecuenciaRespiratoria: Number = null;
    mensaje: String = null;


    ngOnInit() {
    }

    devolverValores(){
        this.evtData.emit(this.frecuenciaRespiratoria);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.frecuenciaRespiratoria > 10){
        // }
    }

}