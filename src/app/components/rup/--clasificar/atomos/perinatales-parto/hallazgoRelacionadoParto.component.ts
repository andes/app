import { Atomo } from './../../core/atomoComponent';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-HallazgoRelacionadoParto',
    templateUrl: 'hallazgoRelacionadoParto.html'
})
export class HallazgoRelacionadoPartoComponent extends Atomo {

    public selectHallazgoRelacionadoParto: Array<Object> = [
        { id: 'Parto por vía Vaginal', nombre: 'Parto por vía Vaginal' },
        { id: 'Parto por Cesárea', nombre: 'Parto por Cesárea' },
    ];

}
