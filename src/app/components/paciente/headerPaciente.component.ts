import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';
import { Auth } from '@andes/auth';

@Component({
    selector: 'header-paciente',
    templateUrl: 'headerPaciente.html',
      styleUrls: ['headerPaciente.scss']
})
export class HeaderPacienteComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacionPaciente;

    constructor(public auth: Auth) { };

    ngOnInit() {}
}