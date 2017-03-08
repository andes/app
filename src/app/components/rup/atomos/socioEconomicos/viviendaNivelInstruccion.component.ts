import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";



@Component({
    selector: 'rup-ViviendaNivelInstruccion',
    templateUrl: 'viviendaNivelInstruccion.html'
})//@Component

export class ViviendaNivelInstruccionComponent implements OnInit {

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
    public SelectNivel: Array<Object> = [{ id: 'Primario Completo', nombre: 'Primario Completo' },
    { id: 'Secundario Completo', nombre: 'Secundario Completo' },
    { id: 'Terciario/Universitario', nombre: 'Terciario/Universitario' },
    ]; //SelectNivel 

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
    }//ngOnInit()


    devolverValores() { //Hacer las validaciones       
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }//devolverValores()

    getMensajes() { } //getMensajes()

}//export class ViviendaNivelInstruccionComponent