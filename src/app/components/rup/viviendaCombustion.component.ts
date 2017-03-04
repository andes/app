import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaCombustion',
    templateUrl: 'viviendaCombustion.html'
})//@Component

export class ViviendaCombustionComponent implements OnInit {

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
    public SelectCombustion: Array<Object> = [{ id: 'Gas Natural', nombre: 'Gas Natural' },
    { id: 'Garrafa', nombre: 'Garrafa' },
    { id: 'Leña/Carbon', nombre: 'Leña/Carbon' },
    { id: 'Kerosén', nombre: 'Kerosén' },
    { id: 'Electricidad', nombre: 'Electricidad' },
    { id: 'Otro ', nombre: 'Otro ' },
    ]; //SelectCombustion:Array  

    ngOnInit() {

        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : [];
    }//ngOnInit()


    devolverValores() { //Hacer las validaciones
        if (this.data[this.tipoPrestacion.key]) {
            this.data[this.tipoPrestacion.key] = this.data[this.tipoPrestacion.key].map(elemento => { return elemento.id });
        } //if (this.ViviendaCombustion)               
        else this.data[this.tipoPrestacion.key] = [];

        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() { } //getMensajes()

}//export class ViviendaCombustionComponent