import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";


@Component({
    selector: 'rup-observaciones',
    templateUrl: 'observaciones.html'
})
export class ObservacionesComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Input('soloValores') soloValores: Boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    observaciones: Number = null;

    data: any = {};
    mensaje: any = {};

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
    }

    devolverValores() {
		this.mensaje = this.getMensajes();
		this.evtData.emit(this.data);
	}

	getMensajes() {

		let mensaje: any = {
			texto: '',
			class: 'danger'
		};

		return mensaje;
	}

}