import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-PerinatalesNumeroGesta',
    templateUrl: 'perinatalesNumeroGesta.html'
})
export class PerinatalesNumeroGestaComponent implements OnInit {
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

        let NroGesta;
        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };

        NroGesta = this.data[this.tipoPrestacion.key];

        if (NroGesta === 1) { mensaje.texto = 'Primigesta' }

        return mensaje;
    } //getMensajes()

}//export class PerinatalesNumeroGestaComponent