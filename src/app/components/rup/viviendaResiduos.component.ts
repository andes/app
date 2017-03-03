import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaResiduos',
    templateUrl: 'viviendaResiduos.html'
})//@Component

export class ViviendaResiduosComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {
        mensaje: {
            class: "",
            texto: "",
        },
    };

    // Esta lista se deberá cargar en algún schema...(Ver más adelante)                          
    public SelectResiduos: Array<Object> = [{ id: 'Recolección', nombre: 'Recolección' },
    { id: 'Entierran', nombre: 'Entierran' },
    { id: 'Queman', nombre: 'Queman' },
    { id: 'Otra', nombre: 'Otra' },
    ]; //SelectResiduos:Array  


    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : [];
    }//ngOnInit()


    devolverValores() { //Hacer las validaciones
        if (this.data[this.tipoPrestacion.key]) {
            this.data[this.tipoPrestacion.key] = this.data[this.tipoPrestacion.key].map(elemento => { return elemento.id });
        } //if (this.ViviendaResiduos)               
        else this.data.valor = [];

        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() { };

}//export class ViviendaResiduosComponent