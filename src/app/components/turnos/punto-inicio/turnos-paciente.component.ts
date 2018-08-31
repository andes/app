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
    cambioMotivo: boolean;
    turnoArancelamiento: any;
    showMotivoConsulta = false;
    ultimosTurnos: any[];
    puedeRegistrarAsistencia: boolean;
    puedeLiberarTurno: boolean;
    agenda: IAgenda;
    showLiberarTurno: boolean;
    todaysdate: Date;
    _turnos: any;
    _operacion: string;
    tituloOperacion = 'Operaciones de Turnos';
    turnosPaciente: any;
    turnosSeleccionados: any[] = [];
    showPuntoInicio = true;
    @Input('operacion')
    set operacion(value: string) {
        this._operacion = value;
    }
    get operacion(): string {
        return this._operacion;
    }

    @Input('turnos')
    set turnos(value: any) {
        if (value) {
            this._turnos = value;
            this.turnosPaciente = value;
        }
    }
    get turnos(): any {
        return this._turnos;
    }
    @Output() turnosPacienteChanged = new EventEmitter<any>();
    @Output() showArancelamientoForm = new EventEmitter<any>();

    // Inicialización
    constructor(public serviceTurno: TurnoService, public serviceAgenda: AgendaService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        this.puedeRegistrarAsistencia = this.auth.getPermissions('turnos:turnos:registrarAsistencia').length > 0;
        this.puedeLiberarTurno = this.auth.getPermissions('turnos:turnos:liberarTurno').length > 0;
        this.todaysdate = new Date();
        this.todaysdate.setHours(0, 0, 0, 0);
    }

    cambiarMotivo() {
        this.cambioMotivo = true;
    }

    showPanel() {
        this.showMotivoConsulta = false;
        this.showLiberarTurno = false;
    }
    showArancelamiento(turno) {
        this.turnoArancelamiento = turno;
        this.showMotivoConsulta = true;
    }

    printArancelamiento(turno) {
        if (this.cambioMotivo) {
            let data = {
                motivoConsulta: turno.motivoConsulta
            };
            let bloqueId = (turno.bloque_id) ? turno.bloque_id : -1;
            this.serviceTurno.patch(turno.agenda_id, bloqueId, turno.id, data).subscribe(resultado => {

            });
        }
        this.showArancelamientoForm.emit(turno);
    }


    eventosTurno(turno, operacion) {
        let mensaje = '';
        let tipoToast = 'info';
        let patch: any = {
            op: operacion,
            turnos: [turno._id],
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(turno.agenda_id, patch).subscribe(resultado => {
            this.turnosPacienteChanged.emit();
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
        // });

    }

    liberarTurno(turno) {
        this.turnosSeleccionados = [turno];
        this.serviceAgenda.getById(turno.agenda_id).subscribe(resultado => {
            this.agenda = resultado; // obtiene la agenda para enviarla al componente liberar-turno
            this.showLiberarTurno = true;
        });
    }

    afterLiberarTurno() {
        this.showLiberarTurno = false;
        this.turnosPacienteChanged.emit();
    }

    isToday(turno) {
        return (moment(turno.horaInicio)).isSame(new Date(), 'day');
    }

}
