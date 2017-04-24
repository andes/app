import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../interfaces/IPaciente';


@Component({
    selector: 'header-paciente',
    templateUrl: 'headerPaciente.html',
      styleUrls: ['headerPaciente.css']
})
export class HeaderPacienteComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacionPaciente;

    ngOnInit() {}
}