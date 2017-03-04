import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
export class SaturacionOxigenoComponent implements OnInit {

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
        let saturacionOxigeno = this.data[this.tipoPrestacion.key];
        let edadEnMeses;
        edadEnMeses = 8; //Falta la edad en meses esta asi para probar.. 
        
        let mensaje: any = {
			texto: '',
			class: 'outline-danger'
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