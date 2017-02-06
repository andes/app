import { Component, Output, Input, EventEmitter } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent {

    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    observaciones: Number = null;
    mensaje: String = null;

    ngOnInit() {
    }

    devolverValores() {
        this.evtData.emit(this.observaciones);
    }

}