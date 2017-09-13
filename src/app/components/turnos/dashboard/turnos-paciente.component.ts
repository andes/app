import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// Interfaces
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
@Component({
    selector: 'turnos-paciente',
    templateUrl: 'turnos-paciente.html',
    styleUrls: ['turnos-paciente.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})

export class TurnosPacienteComponent implements OnInit {

    _paciente: IPaciente;
    _operacion: string;
    tituloOperacion: string = 'Operaciones de Turnos';
    turnosPaciente = [];

    @Input('operacion')
    set operacion(value: string) {
        this._operacion = value;
    }
    get operacion(): string {
        return this._operacion;
    }

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
    constructor(public serviceTurno: TurnoService, public serviceAgenda: AgendaService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
    }

    eventosTurno(turno, operacion) {
        let mensaje = '';
        let tipoToast = 'info';
        let patch: any = {
            op: operacion,
            turnos: [turno],
            'idTurno': turno._id
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patchMultiple(turno.agenda_id, patch).subscribe(resultado => {
            let agenda = resultado;

            let datosTurno = { pacienteId: this._paciente.id };
            this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
                this.turnosPaciente = turnos;
                switch (operacion) {
                    case 'darAsistencia':
                        mensaje = 'Se registro la asistencia del paciente';
                        tipoToast = 'success';
                        break;
                    case 'sacarAsistencia':
                        mensaje = 'Se registro la inasistencia del paciente';
                        tipoToast = 'warning';
                        break;
                    case 'liberarTurno':
                        mensaje = 'Se anuló el turno del paciente';
                        tipoToast = 'danger';
                        break;
                }
                this.plex.toast(tipoToast, mensaje);
            });
        });

    }

}
