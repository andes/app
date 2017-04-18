import { Molecula } from './../molecula.component';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
@Component({
    selector: 'rup-EscalaDeDesarrollo',
    templateUrl: 'escalaDeDesarrollo.html'
})
export class EscalaDeDesarrolloComponent extends Molecula {
}