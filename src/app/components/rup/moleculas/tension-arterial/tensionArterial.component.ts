import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-tension-arterial',
    templateUrl: 'tensionArterial.html'
})
export class TensionArterialComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;
    //@Input('soloValores') soloValores: Boolean;

    // resultados a devolver
    data: any = {};

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }


    ngOnInit() {
        // como es una molécula buscamos sus atomos
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });
            // if (this.datosIngreso) {
            //     tipoPrestacion.ejecucion.forEach(obj => {
            //         this.onReturnComponent(obj, this.tipoPrestacion);
            //     });

        // si vienen datos por input, los asignamos a nuestro objeto data
            this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {

         // valor: variable con el resultado qeu viene del input del formulario
        let valor = (typeof obj !== 'undefined' && obj && obj[tipoPrestacion.key]) ? obj[tipoPrestacion.key] : null;    

        if (valor) {
                if (!this.data[this.tipoPrestacion.key]) {
                    this.data[this.tipoPrestacion.key] = {};
                }

                if (!this.data[this.tipoPrestacion.key][tipoPrestacion.key]) {
                    this.data[this.tipoPrestacion.key][tipoPrestacion.key] = {};
                }
            this.data[this.tipoPrestacion.key][tipoPrestacion.key] = valor;

        } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && valor == null ) {           
                delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
        }

        if (!Object.keys(this.data[this.tipoPrestacion.key]).length) {
            this.data = {};
        }

        this.evtData.emit(this.data);
    } // onReturnComponent(obj: any, tipoPrestacion: any)


    }
