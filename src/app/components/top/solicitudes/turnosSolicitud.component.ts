import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { TurnoService } from '../../../services/turnos/turno.service';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'turnos-solicitud',
    templateUrl: './turnosSolicitudes.html'
})
export class TurnosSolicitudComponent implements OnInit {
    private _prestacionSeleccionada: any;
    @Input()
    set prestacionSeleccionada(value: any) {
        this._prestacionSeleccionada = value;
        if (value && value.paciente) {
            this._paciente = value.paciente;
            this.cargarTurnos();
        }
    }

    get prestacionSeleccionada() {
        return this._prestacionSeleccionada;
    }
    private _turnoSeleccionado: any;
    @Input()
    set turnoSeleccionado(value: any) {
        this._turnoSeleccionado = value;
        if (value) {
            this.turnosPaciente = [value];
        }
    }

    get turnoSeleccionado() {
        return this._turnoSeleccionado;
    }

    todaysdate: Date;
    _turnos: any;
    turnosPaciente: any;
    public _paciente: IPaciente;

    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
        if (value) {
            this.cargarTurnos();
        }
    }
    get paciente(): any {
        return this._paciente;
    }

    cargarTurnos() {
        const pacienteId = this._paciente?.id || (this._paciente as any)?._id;
        if (pacienteId) {
            this.serviceTurno.getHistorial({ pacienteId }).subscribe(turnos => {
                const turnosFiltrados = turnos.filter(t => t.estado !== 'liberado' && moment(t.horaInicio).isSameOrAfter(this.todaysdate, 'day'));
                this.turnosPaciente = turnosFiltrados.sort((a, b) => {
                    const inia = a.horaInicio ? new Date(a.horaInicio) : null;
                    const inib = b.horaInicio ? new Date(b.horaInicio) : null;
                    return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
                });
            });
        }
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

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public plex: Plex,
        public auth: Auth) {
        this.todaysdate = new Date();
        this.todaysdate.setHours(0, 0, 0, 0);
    }

    ngOnInit() {
    }

    isToday(turno) {
        return (moment(turno.horaInicio)).isSame(new Date(), 'day');
    }
}
