import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";

@Component({
    selector: 'rup-ControlDeEsfinteres',
    templateUrl: 'controlDeEsfinteres.html'
})
export class ControlDeEsfinteresComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

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