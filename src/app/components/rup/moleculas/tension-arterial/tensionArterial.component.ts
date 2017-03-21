import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

import { IPaciente } from './../../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-tension-arterial',
    templateUrl: 'tensionArterial.html'
})
export class TensionArterialComponent implements OnInit {

    @Input('paciente') paciente: any;
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('soloValores') soloValores: Boolean;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    // resultados a devolver
    data: any = {};

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};


        // como es una molécula buscamos sus atomos
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;

            // si tengo valores cargados entonces devuelvo los resultados y mensajes
            // como es molecula 
            if (this.datosIngreso) {
                tipoPrestacion.ejecucion.forEach(obj => {
                    this.onReturnComponent(obj, this.tipoPrestacion);
                });

            }
        });
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {

            if (obj[tipoPrestacion.key]) {
            this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

            } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && obj[tipoPrestacion.key] == null ) {
                delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
            }
            this.evtData.emit(this.data);
    } // onReturnComponent(obj: any, tipoPrestacion: any)


    }
