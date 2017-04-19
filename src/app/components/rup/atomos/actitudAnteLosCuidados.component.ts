import { Atomo } from './atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";
@Component({
    selector: 'rup-ActitudAnteLosCuidados',
    templateUrl: 'actitudAnteLosCuidados.html'
})
export class ActitudAnteLosCuidadosComponent extends Atomo {
}