import { Atomo } from './../atomoComponent';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'rup-partoViaVaginal',
    templateUrl: 'partoViaVaginal.html'
})
export class PartoViaVaginalComponent extends Atomo {

   ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {
            valor: null,
            detalle: null
        };
        if (this.data[this.tipoPrestacion.key].valor) {
            this.devolverValores();
        }
    }

    public selectPartoViaVaginal: Array<Object> = [
        { id: 'Parto vaginal asistido con extractor de vacio', nombre: 'Parto vaginal asistido con extractor de vacio' },
        { id: 'Parto Vaginal con fórceps y cuidados postparto', nombre: 'Parto Vaginal con fórceps y cuidados postparto' },
    ];
  
}