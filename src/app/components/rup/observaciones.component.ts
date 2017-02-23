import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    observaciones: Number = null;
    mensaje: String = null;

     data: any = {
        valor: this.observaciones,
        mensaje: {
            texto: String,
        },
    };

    ngOnInit() {
        // if (this.datosIngreso) {
        //     this.observaciones = this.datosIngreso;
        // }
    }

    devolverValores() {
        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.observaciones;
        this.evtData.emit(this.data);
    }

}