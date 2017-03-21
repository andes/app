import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

// import { IPaciente } from './../../../interfaces/IPaciente';
// import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: 'signosVitales.html'
})
export class SignosVitalesComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;

    // resultados a devolver
    data: any = {};

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    ngOnInit() {
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });

        // si vienen datos por input, los asignamos a nuestro objeto data
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {

            if (obj[tipoPrestacion.key]) {
            this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

            } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && obj[tipoPrestacion.key] == null ) {
                delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
            }
            this.evtData.emit(this.data);
    }

}