import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";

@Component({
	selector: 'rup-temperatura',
	templateUrl: 'temperatura.html'
})

export class TemperaturaComponent implements OnInit {

	@Input('datosIngreso') datosIngreso: any;
	@Input('paciente') paciente: IPaciente;
	@Input('tipoPrestacion') tipoPrestacion: any;
	@Input('soloValores') soloValores: Boolean;
	@Input('required') required: Boolean;
	@Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

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
			this.mensaje = this.getMensajes();
			this.evtData.emit(this.data);
	}

	getMensajes() {
		let temperatura = this.data[this.tipoPrestacion.key];
		let mensaje: any = {
			texto: '',
			class: 'outline-danger'
		};

		// agregar validaciones

		if (temperatura) {
			if (temperatura > 38) {
				mensaje.texto = 'Fiebre';
			} else {
				mensaje.texto = 'Normal';
			}
		}

		return mensaje;
	}
}
