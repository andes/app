import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'header-paciente',
    templateUrl: 'headerPaciente.html'
})
export class HeaderPacienteComponent implements OnInit {

    @Input() paciente: IPaciente;


    ngOnInit() {

    }
}