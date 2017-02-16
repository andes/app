import { Component, Output, Input, EventEmitter } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    observaciones: Number = null;
    mensaje: String = null;

  ngOnInit() {
        if (this.datosIngreso) {
            this.observaciones = this.datosIngreso;
        }
    }

    devolverValores() {
        this.evtData.emit(this.observaciones);
    }

}