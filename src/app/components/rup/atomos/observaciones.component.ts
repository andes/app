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
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    observaciones: Number = null;
    mensaje: String = null;

    data: any = {
        mensaje: {
            texto: String,
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

		let mensaje: any = {
			texto: '',
			class: 'outline-danger'
		};

		return mensaje;
	}

}