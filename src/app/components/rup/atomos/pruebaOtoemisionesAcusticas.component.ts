import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-PruebaOtoemisionesAcusticas',
    templateUrl: 'pruebaOtoemisionesAcusticas.html'
})
export class PruebaOtoemisionesAcusticasComponent implements OnInit {
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



    public selectPruebaOtoemisionesAcusticas: Array<Object> = [
        { id: 'si', nombre: 'Si' },
        { id: 'no', nombre: 'No' },
        { id: ' no se hizo', nombre: ' No se hizo' },
        { id: 'sin información', nombre: 'Sin información' },
    ];
    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            fecha: null
        };

    }

    devolverValores() {
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }


    getMensajes() {
        let mensaje: any = {
            texto: '',
            class: 'danger'
        };
        if (this.data[this.tipoPrestacion.key].id != 'si') {
            mensaje.texto = 'alarma'; //ver el texto que va a alertar
        }
        return mensaje;
    }
}