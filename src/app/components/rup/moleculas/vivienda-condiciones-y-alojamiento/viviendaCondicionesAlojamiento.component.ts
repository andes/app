import { Molecula } from './../molecula.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";
import { TipoPrestacionService } from "../../../../services/tipoPrestacion.service";


@Component({
    selector: 'rup-ViviendaCondicionesAlojamiento',
    templateUrl: 'viviendaCondicionesAlojamiento.html'
})//@Component

export class ViviendaCondicionesAlojamientoComponent extends Molecula {

    // @Input('datosIngreso') datosIngreso: any;
    // @Input('tipoPrestacion') tipoPrestacion: any;
    // @Input('paciente') paciente: IPaciente;
    // @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    // }

    // data: any = {
    //     mensaje: {
    //         class: "",
    //         texto: "",
    //     },
    // };


    // ngOnInit() {
    //     this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
    //         this.tipoPrestacion = tipoPrestacion;
    //     });

    //     // si vienen datos por input, los asignamos a nuestro objeto data
    //     this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    // } //ngOnInit()



    // onReturnComponent(obj: any, tipoPrestacion: any) {
    //     this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];
    //     this.evtData.emit(this.data);
    // } // onReturnComponent


    // getMensajes() {
    // };

}