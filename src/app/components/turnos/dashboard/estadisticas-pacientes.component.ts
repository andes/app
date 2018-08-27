import { PacienteService } from './../../../services/paciente.service';
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

    nroCarpeta: any;
    public _paciente: IPaciente;
    turnosPaciente: any;
    ultimosTurnos: any;
    @Input('paciente')
    set paciente(value: any) {
        this.turnosOtorgados = 0;
        this.inasistencias = 0;
        this.anulaciones = 0;
        this.pacienteSeleccionado = value;
        this._paciente = value;

    }
    get agenda(): any {
        return this._paciente;
    }

    @Output() showArancelamientoForm = new EventEmitter<any>();

    pacienteSeleccionado: IPaciente;
    public fechaDesde: any;
    public fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    anulaciones = 0;
    idOrganizacion = this.auth.organizacion.id;
    carpetaEfector: any;

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public plex: Plex,
        public auth: Auth,
        public serviceLogPaciente: LogPacienteService,
        public servicePaciente: PacienteService) { }

    ngOnInit() {
        // Se cargan los datos calculados
        let hoy = {
            fechaDesde: moment().startOf('month').format(),
            fechaHasta: moment().endOf('day').format()
        };
        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);
        this.carpetaEfector = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.getPaciente();

    }

    arancelamiento(turno) {
        this.showArancelamientoForm.emit(turno);

    }

    getPaciente() {
        this.servicePaciente.getById(this.pacienteSeleccionado.id).subscribe(
            pacienteMPI => {
                this._paciente = pacienteMPI;
                if (this._paciente && this._paciente.id) {
                    let datosTurno = { pacienteId: this._paciente.id };
                    let cantInasistencias = 0;
                    // Se muestra la cantidad de turnos otorgados e inasistencias
                    this.serviceTurno.getHistorial(datosTurno).subscribe(turnos => {
                        turnos.forEach(turno => {
                            if (turno.asistencia && turno.asistencia === 'noAsistio') {
                                cantInasistencias++;
                            }
                        });
                        this.turnosOtorgados = turnos.length;
                        this.inasistencias = cantInasistencias;
                        this.sortTurnos(turnos);
                        this.turnosPaciente = turnos.filter(t => {
                            return moment(t.horaInicio).isSameOrAfter(new Date(), 'day');
                        });

                        this.ultimosTurnos = turnos.filter(t => {
                            return moment(t.horaInicio).isSameOrBefore(new Date(), 'day');
                        });

                    });

                    // Se muestra la cantidad de turnos anulados
                    let datosLog = { idPaciente: this._paciente.id, operacion: 'turnos:liberar' };
                    this.serviceLogPaciente.get(datosLog).subscribe(logs => {
                        if (logs && logs.length) {
                            this.anulaciones = logs.length;
                        }
                    });
                }
            });
    }

    private sortTurnos(turnos) {
        turnos = turnos.sort((a, b) => {
            let inia = a.horaInicio ? new Date(a.horaInicio) : null;
            let inib = b.horaInicio ? new Date(b.horaInicio) : null;
            {
                return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
            }
            ;
        });
    }
}
