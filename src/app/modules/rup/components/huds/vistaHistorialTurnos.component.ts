import moment from 'moment';
import { Component, Input, OnInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'historial-turnos',
    templateUrl: 'vistaHistorialTurnos.html',
})

export class VistaHistorialTurnosComponent implements OnInit {
    @Input() paciente: IPaciente;

    historial;

    constructor(
        public serviceTurno: TurnoService,
    ) { }

    ngOnInit() {
        this.getHistorial();
    }

    private getHistorial() {
        this.serviceTurno.getHistorial({ pacienteId: this.paciente.id }).subscribe(
            turnos => this.historial = this.sortByHoraInicio(turnos)
        );
    }

    private sortByHoraInicio(turnos: any[]) {
        return turnos.sort((a, b) => {
            const inia = a.horaInicio ? moment(a.horaInicio).toDate() : null;
            const inib = b.horaInicio ? moment(b.horaInicio).toDate() : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });
    }
}
