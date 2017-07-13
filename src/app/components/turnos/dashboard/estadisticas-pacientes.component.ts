import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import * as calculos from './../../../utils/calculosDashboard';
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { LogPacienteService } from '../../../services/logPaciente.service';

@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html'
})

export class EstadisticasPacientesComponent implements OnInit {

    @Input('paciente') paciente: IPaciente;

    public fechaDesde: any;
    public fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    anulaciones = 0;

    // Inicialización
    constructor(public serviceTurno: TurnoService, public plex: Plex, public auth: Auth, public serviceLogPaciente: LogPacienteService) { }

    ngOnInit() {
        // Se cargan los datos calculados
        let hoy = {
            fechaDesde: moment().startOf('day').format(),
            fechaHasta: moment().endOf('day').format()
        };
        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);
        let datosTurno = { pacienteId: this.paciente.id };

        // TODO: filtrar los turnos por fechas

        let cantInasistencias = 0;

        // Se muestra la cantidad de turnos otorgados e inasistencias
        this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
            turnos.forEach(turno => {
                if (turno.asistencia === 'noAsistio') {
                    cantInasistencias++;
                }
            });
            this.turnosOtorgados = turnos.length;
            this.inasistencias = cantInasistencias;
        });

        // Se muestra la cantidad de turnos anulados
        let datosLog = { idPaciente: this.paciente.id, operacion: 'turnos:liberar' };
        this.serviceLogPaciente.get(datosLog).subscribe(logs => {
            if (logs && logs.length) {
                this.anulaciones = logs.length;
            }
        });

    }



}
