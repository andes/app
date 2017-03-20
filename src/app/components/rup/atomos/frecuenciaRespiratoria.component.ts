import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";

@Component({
	selector: 'rup-frecuencia-respiratoria',
	templateUrl: 'frecuenciaRespiratoria.html'
})

export class FrecuenciaRespiratoriaComponent implements OnInit {
	@Input('datosIngreso') datosIngreso: any;
	@Input('tipoPrestacion') tipoPrestacion: any;
	@Input('paciente') paciente: IPaciente;
	@Input('soloValores') soloValores: Boolean;

	@Output() evtData: EventEmitter<any> = new EventEmitter<any>();

	data: any = {
		valor: '',
		mensaje: {
			class: "",
			texto: ""
		},
	};


	ngOnInit() {
		this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

		// si tengo valores cargados entonces devuelvo los resultados y mensajes
		if (this.datosIngreso) {
            this.devolverValores();
        }
	}

	devolverValores() {
		this.data.mensaje = this.getMensajes();
		this.evtData.emit(this.data);
	}

	getMensajes() {
		let Edad;
		let Sexo;
		let frecuenciaRespiratoria;
		let mensaje: any = {
			texto: '',
			class: 'outline-danger'
		};

		Sexo = this.paciente.sexo
		Edad = this.paciente.edad;
		frecuenciaRespiratoria = this.data[this.tipoPrestacion.key];

		if (frecuenciaRespiratoria) {

			// agregar validaciones
			// Ver validacines para NEO - Ver unidad de la edad 
			// Ver validaciones - Falta definición para lograr identidicarlos                                                                   
			if (this.paciente.edadReal.unidad === 'Días' || this.paciente.edadReal.unidad === 'Meses' || this.paciente.edadReal.unidad === 'Horas') {

				//Prematuro -ver el peso del paciente   
				if (frecuenciaRespiratoria >= 40 && frecuenciaRespiratoria <= 90) { mensaje.texto = 'Paciente Prematuro: Dentro de los parámetros normales' }
				else { mensaje.texto = 'Paciente Prematuro: Fuera de los parámetros normales' }

				// Recien Nacido a término     
				if (frecuenciaRespiratoria >= 30 && frecuenciaRespiratoria <= 80) { mensaje.texto = 'Paciente Recien Nacido a término: Dentro de los parámetros normales' }
				else { mensaje.texto = 'Paciente Recien Nacido a término: Fuera de los parámetros normales' }
			}

			// Pacientes Años
			if (this.paciente.edadReal.unidad === 'Años') {

				if (this.paciente.edadReal.valor === 1) {
					if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 40) { mensaje.texto = 'Paciente de  1 año: Dentro de los parámetros normales' }
					else { mensaje.texto = '1 año: Fuera de los parámetros normales' }
				}

				if (this.paciente.edadReal.valor === 2) {
					if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 30) { mensaje.texto = 'Paciente de  2 años: Dentro de los parámetros normales' }
					else { mensaje.texto = '2 años: Fuera de los parámetros normales' }
				}

				if (this.paciente.edadReal.valor === 5) {
					if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 25) { mensaje.texto = 'Paciente de  5 años: Dentro de los parámetros normales' }
					else { mensaje.texto = '5 años: Fuera de los parámetros normales' }
				}

				if (this.paciente.edadReal.valor === 10) {
					if (frecuenciaRespiratoria >= 17 && frecuenciaRespiratoria <= 22) { mensaje.texto = 'Paciente de  10 años: Dentro de los parámetros normales' }
					else { mensaje.texto = '10 años: Fuera de los parámetros normales' }
				}

				if (this.paciente.edadReal.valor === 15) {
					if (frecuenciaRespiratoria >= 15 && frecuenciaRespiratoria <= 20) { mensaje.texto = 'Paciente de 15 años: Dentro de los parámetros normales' }
					else { mensaje.texto = '15 años: Fuera de los parámetros normales' }
				}
				if (this.paciente.edadReal.valor > 17) {
					if (frecuenciaRespiratoria >= 12 && frecuenciaRespiratoria <= 20) { mensaje.texto = 'Paciente Adulto: Dentro de los parámetros normales' }
					else { mensaje.texto = 'Adulto: Fuera de los parámetros normales' }
				}
			} // If Pacientes Años

		}
	
		return mensaje;
	}


}

