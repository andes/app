import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
export class SaturacionOxigenoComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    saturacionOxigeno: Number = null;
    mensaje: String = null;
    class: String = "";

    data: any = {
        valor: Number,
        mensaje: {
            class: "",
            texto: ""
        },
    };
    ngOnInit() {
        if (this.datosIngreso) {
            this.saturacionOxigeno = this.datosIngreso;
        }
    }

    devolverValores() {
        this.class = 'outline-danger';
        this.data.valor = this.saturacionOxigeno;

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        if (this.saturacionOxigeno >= 90 && this.saturacionOxigeno <= 94) {

            this.mensaje = 'Hipoxemia';
        }
        if (this.saturacionOxigeno <= 94) {

            this.mensaje = 'Hipoxemia Severa';
        }
        this.data.valor = this.saturacionOxigeno;
        this.data.mensaje.class = this.class;
        this.data.mensaje.texto = this.mensaje;
        this.evtData.emit(this.data);
    }

}