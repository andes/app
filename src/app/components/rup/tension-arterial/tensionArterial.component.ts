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
        valor: {},
        mensaje: {
            texto: '',
        },
    };

    // tipos de prestaciones a utilizar
    tensionDiastolica: any;
    tensionSistolica: any;
    valor = {
        tensionDiastolica: null,
        tensionSistolica: null,
    };

    ngOnInit() {
        if (this.datosIngreso) {
            console.log("TENSION ARTERIAL");
            console.log(this.datosIngreso);
            // this.data.valor.tensionDiastolica = (this.datosIngreso.tensionDiastolica) ? this.datosIngreso.tensionDiastolica : null;
            // this.data.valor.tensionSistolica = (this.datosIngreso.tensionSistolica) ? this.datosIngreso.tensionSistolica : null;
        }

        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {
        this.data.valor[tipoPrestacion.key] = obj.valor;
        // this.data.mensaje.texto = this.data.mensaje.texto + " -" + valor.mensaje.texto;
        this.evtData.emit(this.data);
    }

}