import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import * as calculos from './../../../utils/calculosDashboard';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';

@Component({
    selector: 'estadisticas-agendas',
    templateUrl: 'estadisticas-agendas.html'
})

export class EstadisticasAgendasComponent implements OnInit {

    cantTurnosAsignados = 125;
    turnosPacientesValidados = 0;
    turnosPacientesTemporales = 0;
    cantTurnosRestantes = 0;
    cantTurnosSuspendidos = 0;
    // Inicialización
    constructor(public serviceTurno: TurnoService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        // Se cargan los datos calculados
        let cantTurnosPorPacientes;
        this.cantidadTurnosPorEstadoPaciente(this.auth.usuario);
        this.cantidadTotalDeTurnosAsignados();
    }

    cantidadTurnosPorEstadoPaciente(userLogged) {
        let datosTurno = { estado: 'asignado', userName: userLogged.username, userDoc: userLogged.documento };
        let countTemporal = 0;
        let countValidado = 0;

        this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
            turnos.forEach(turno => {
                if (turno.paciente.estado === 'temporal') {
                    countTemporal++;
                } else {
                    countValidado++;
                }
            });
            this.turnosPacientesTemporales = countTemporal;
            this.turnosPacientesValidados = countValidado;
        });
    }

    cantidadTotalDeTurnosAsignados() {
        let fecha = moment().format();
        let today = moment(fecha).startOf('day');

        let datosTurno = { estado: 'asignado'};
        this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
            this.cantTurnosAsignados = turnos.length;
        });
    }



}

