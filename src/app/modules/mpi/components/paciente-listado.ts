import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'paciente-listado',
    templateUrl: 'paciente-listado.html',
    styleUrls: ['paciente-listado.scss']
})
export class PacienteListadoComponent {
    /**
     * Listado de pacientes para mostrar
     *
     * @type {IPaciente[]}
     * @memberof PacienteListadoComponent
     */
    @Input() pacientes: IPaciente[];
    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<any>}
     * @memberof PacienteListadoComponent
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    /**
     * Evento que se emite cuando el mouse está sobre un paciente
     *
     * @type {EventEmitter<any>}
     * @memberof PacienteListadoComponent
     */
    @Output() hover: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();


    constructor(private plex: Plex) {
    }

    public seleccionar(paciente: IPaciente) {
        this.selected.emit(paciente);
    }

    public hoverPaciente(paciente: IPaciente) {
        this.selected.emit(paciente);
    }
}
