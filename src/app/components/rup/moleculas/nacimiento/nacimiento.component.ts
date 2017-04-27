import { Molecula } from './../../core/molecula.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
@Component({
    selector: 'rup-nacimiento',
    templateUrl: 'nacimiento.html'
})
export class NacimientoComponent extends Molecula {
}