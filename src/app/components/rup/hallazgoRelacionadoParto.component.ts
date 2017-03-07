import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-HallazgoRelacionadoParto',
    templateUrl: 'hallazgoRelacionadoParto.html'
})
export class HallazgoRelacionadoPartoComponent implements OnInit {
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

    

    public selectHallazgoRelacionadoParto: Array<Object> = [
        { id: 'Parto por vía Vaginal', nombre: 'Parto por vía Vaginal' },
        { id: 'Parto por Cesárea', nombre: 'Parto por Cesárea' },
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


    }
}