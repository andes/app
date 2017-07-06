import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// Interfaces
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';

@Component({
    selector: 'turnos-paciente',
    templateUrl: 'turnos-paciente.html'
})

export class TurnosPacienteComponent implements OnInit {

    _paciente: IPaciente;
    tituloOperacion: string;
    turnosPaciente = [];

    @Input() operacion: string;
    @Input('paciente')
    set paciente(value: IPaciente) {
        this._paciente = value;
        if (value) {
            let datosTurno = { pacienteId: this._paciente.id };

            this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
                this.turnosPaciente = turnos;
            });
        }
    }
    get paciente(): IPaciente {
        return this._paciente;
    }

    // Inicialización
    constructor(public serviceTurno: TurnoService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        // Se buscan los turnos del paciente
        // debugger;
        // let datosTurno = { pacienteId: this.paciente.id };

        // this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
        //     debugger;
        //     this.turnosPaciente = turnos;
        // });
        switch (this.operacion) {
            case 'anulacionTurno':
                this.tituloOperacion = 'Liberar Turno';
                break;
            case 'registrarAsistencia':
                this.tituloOperacion = 'Registro de Asistencia del Paciente';
                break;
        }

    }

}
