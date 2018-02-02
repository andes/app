import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

// Interfaces
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import { ITurno } from '../../../interfaces/turnos/ITurno';
@Component({
    selector: 'turnos-paciente',
    templateUrl: 'turnos-paciente.html',
    styleUrls: ['turnos-paciente.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})

export class TurnosPacienteComponent implements OnInit {
    agenda: IAgenda;
    showLiberarTurno: boolean;

    _paciente: IPaciente;
    _operacion: string;
    tituloOperacion = 'Operaciones de Turnos';
    turnosPaciente = [];
    turnosSeleccionados: any[] = [];


    @Input('operacion')
    set operacion(value: string) {
        this._operacion = value;
    }
    get operacion(): string {
        return this._operacion;
    }

    @Input('paciente')
    set paciente(value: IPaciente) {
        if (value) {
            this._paciente = value;
            this.getTurnosPaciente(this._paciente);
        }
    }
    get paciente(): IPaciente {
        return this._paciente;
    }

    // Inicialización
    constructor(public serviceTurno: TurnoService, public serviceAgenda: AgendaService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        let puedeRegistrarAsistencia = this.auth.getPermissions('turnos:turnos:registrarAsistencia:').length > 0;
        let puedeLiberarTurno = this.auth.getPermissions('turnos:turnos:liberarTurno:').length > 0;
    }

    getTurnosPaciente(paciente) {
        if (paciente.id) {
            let datosTurno = { pacienteId: paciente.id };
            // Obtenemos los turnos del paciente, quitamos los viejos y aplicamos orden descendente
            this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
                this.turnosPaciente = turnos.filter(t => {
                    return moment(t.horaInicio).isSameOrAfter(new Date(), 'day');
                });
                this.turnosPaciente = this.turnosPaciente.sort((a, b) => {
                    return moment(a.horaInicio).isAfter(moment(b.horaInicio)) ? 0 : 1;
                });
            });
        }
    }

    eventosTurno(turno, operacion) {
        let mensaje = '';
        let tipoToast = 'info';
        let patch: any = {
            op: operacion,
            turnos: [turno._id],
            // 'idTurno': turno._id
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(turno.agenda_id, patch).subscribe(resultado => {

            let agenda = resultado;
            let datosTurno = { pacienteId: this._paciente.id };
            this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
                this.turnosPaciente = turnos.filter(t => {
                    return moment(t.horaInicio).isSameOrAfter(new Date(), 'day');
                });
                this.turnosPaciente = this.turnosPaciente.sort((a, b) => {
                    return moment(a.horaInicio).isAfter(moment(b.horaInicio)) ? 0 : 1;
                });
                // this.turnosPaciente = turnos;
                switch (operacion) {
                    case 'darAsistencia':
                        mensaje = 'Se registro la asistencia del paciente';
                        tipoToast = 'success';
                        break;
                    case 'sacarAsistencia':
                        mensaje = 'Se registro la inasistencia del paciente';
                        tipoToast = 'warning';
                        break;
                }
                if (mensaje !== '') {
                    this.plex.toast(tipoToast, mensaje);
                }
            });
        });

    }

    liberarTurno(turno) {
        this.turnosSeleccionados = [turno];
        this.serviceAgenda.getById(turno.agenda_id).subscribe(resultado => {
            this.agenda = resultado; // obtiene la agenda para enviarla al componente liberar-turno
            this.showLiberarTurno = true;
        });
    }

    cancelaLiberarTurno() {
        this.showLiberarTurno = false;
    }

    saveLiberarTurno(agenda: any, pac) {
        this.getTurnosPaciente(pac);
        this.showLiberarTurno = false;
    }
}
