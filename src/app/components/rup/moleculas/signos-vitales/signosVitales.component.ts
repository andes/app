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
        // valor: variable con el resultado qeu viene del input del formulario
        console.log(!obj);
        let valor = (typeof obj !== 'undefined' && obj && obj[tipoPrestacion.key]) ? obj[tipoPrestacion.key] : null;
        console.log('1', this.data);
        console.log('**', valor);
        // debugger;
        if (valor) {
                if (!this.data[this.tipoPrestacion.key]) {
                    this.data[this.tipoPrestacion.key] = {};
                }

                if (!this.data[this.tipoPrestacion.key][tipoPrestacion.key]) {
                    this.data[this.tipoPrestacion.key][tipoPrestacion.key] = {};
                }
                // alert('1');
            this.data[this.tipoPrestacion.key][tipoPrestacion.key] = valor;

        } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && valor == null ) {
            // alert('2');
                delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];

        }

        // alert('cant: ' + Object.keys(this.data[this.tipoPrestacion.key]).length);
        console.log('2', this.data[this.tipoPrestacion.key][tipoPrestacion.key]);

        if (!Object.keys(this.data[this.tipoPrestacion.key]).length) {
            this.data = {};
        }

        console.log('3', this.data);
        this.evtData.emit(this.data);
    }

}