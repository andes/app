import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
export class SaturacionOxigenoComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Input('soloValores') soloValores: Boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {};
    mensaje: any = {};

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
		if (this.datosIngreso) {
            this.devolverValores();
        }
    }

    devolverValores() {
        if (this.data[this.tipoPrestacion.key] === null) {
            this.data = {};
        }
            this.mensaje = this.getMensajes();
            this.evtData.emit(this.data);
	}

        getMensajes() {
        let saturacionOxigeno = this.data[this.tipoPrestacion.key];
        let edadEnMeses;

        // Calculo Edad en Meses
        let edadMeses: any = null;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difDias: any;
        let difMeses: any;
        fechaNac = moment(this.paciente.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd');     // Diferencia en días
        edadEnMeses = Math.trunc(difDias / 30.4375); // Diferencia en Meses


        let mensaje: any = {
            texto: '',
            class: 'danger'
        };

        if (saturacionOxigeno) {

            // agregar validaciones aca en base al paciente y el tipo de prestacion
            if (saturacionOxigeno >= 90 && saturacionOxigeno <= 94) {

                mensaje.texto = 'Hipoxemia';
            }
            if (saturacionOxigeno <= 94) {

                mensaje.texto = 'Hipoxemia Severa';
            }

        }

        return mensaje;
    }

}