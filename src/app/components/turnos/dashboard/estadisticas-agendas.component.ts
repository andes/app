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

    turnosOtorgados = 125;
    // Inicialización
    constructor(public serviceTurno: TurnoService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
    // Se cargan los datos calculados
       console.log('TURNOSSS', this.cantidadTurnosPorEstadoPaciente(this.auth.usuario));

    }

    cantidadTurnosPorEstadoPaciente(userLogged) {
    let serviceTurno: TurnoService;
    let datosTurno = { estado: 'asignado', usuario: userLogged };
    let countTemporal = 0;
    let countValidado = 0;

    serviceTurno.get(datosTurno).subscribe(turnos => {
        turnos.forEach(turno => {
            if (turno.paciente.estado === 'temporal') {
                countTemporal++;
            } else {
                countValidado++;
            }
        });

        return [countTemporal, countValidado];
    });
}

}