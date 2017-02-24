import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

import { IPaciente } from './../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-tension-arterial',
    templateUrl: 'tensionArterial.html'
})
export class TensionArterialComponent implements OnInit {

    @Input('paciente') paciente: any;
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    // resultados a devolver
    data: any = {
        mensaje: {
            texto: '',
        },
    };

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};

        // como es una molécula buscamos sus atomos
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {
        this.data.mensaje = this.getMensajes();
        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

        this.evtData.emit(this.data);
    }

    getMensajes() {

        let mensaje : any = {
            texto: '',
            class: 'outline-danger'
        };

        
        return mensaje;

    }

}