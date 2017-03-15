import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-PercentiloTalla',
    templateUrl: 'percentiloTalla.html'
})
export class PercentiloTallaComponent implements OnInit {
    @Input('paciente') paciente: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('required') required: Boolean;
    @Input('datosIngreso') datosIngreso: any;
    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    data: any = {
        mensaje: {
            class: "",
            texto: ""
        },
    };

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

    }

    devolverValores() {

        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }

    getMensajes() {

       
    }
}