import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-ViviendaFamilia',
    templateUrl: 'viviendaFamilia.html'
})//@Component

export class ViviendaFamiliaComponent implements OnInit {

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
    public SelectFamiliar: Array<Object> = [
        { id: 'Hermana', nombre: 'Hermana' },
        { id: 'Hermano', nombre: 'Hermano' },
        { id: 'Madre', nombre: 'Madre' },
        { id: 'Padre', nombre: 'Padre' },
        { id: 'Abuela Materna', nombre: 'Abuela Materna' },
        { id: 'Abuelo Materno', nombre: 'Abuelo Materno' },
        { id: 'Abuela Paterna', nombre: 'Abuela Paterna' },
        { id: 'Abuelo Paterno', nombre: 'Abuelo Paterno' },
    ]; //tipoPisos:Array

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
    }//ngOnInit()

    devolverValores() { //Hacer las validaciones                   
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() { }

}//export class ViviendaFamiliaComponent
