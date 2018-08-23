import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { IPacienteMatch } from '../interfaces/IPacienteMatch.inteface';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';
import { IPaciente } from '../../../interfaces/IPaciente';

@Component({
    templateUrl: 'demo.html',
    // styleUrls: ['inicio.scss']
})
export class PacienteDemoComponent {
    @HostBinding('class.plex-layout') layout = true;

    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;

    constructor(private plex: Plex) { }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    seleccionarPaciente(paciente: IPaciente) {
        this.plex.info('success', `Seleccionó el paciente ${paciente.apellido}, ${paciente.nombre}`);
        this.pacienteActivo = paciente;
    }

    hoverPaciente(paciente: IPaciente) {
        this.pacienteActivo = paciente;
    }
}
