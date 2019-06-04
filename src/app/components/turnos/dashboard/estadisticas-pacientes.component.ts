import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { TurnoService } from '../../../services/turnos/turno.service';
import { Auth } from '@andes/auth';
import { LogPacienteService } from '../../../services/logPaciente.service';


@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html',
    styleUrls: ['estadisticas-paciente.scss']
})

export class EstadisticasPacientesComponent implements OnInit {

    nroCarpeta: any;
    _paciente: IPaciente;
    turnosPaciente: any;
    ultimosTurnos: any;
    pacienteSeleccionado: IPaciente;
    fechaDesde: any;
    fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    anulaciones = 0;
    idOrganizacion = this.auth.organizacion.id;
    carpetaEfector: any;
    currentTab = 0;
    contactos;
    @Input() showTab: Number = 0;
    @Input('paciente')
    set paciente(value: any) {
        this.pacienteSeleccionado = value;
        this._paciente = value;
        this.getPaciente();

    }
    get paciente(): any {
        return this._paciente;
    }

    @Output() showArancelamientoForm = new EventEmitter<any>();

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public auth: Auth,
        public serviceLogPaciente: LogPacienteService,
    ) { }

    ngOnInit() {
        this.carpetaEfector = {
            organizacion: {
                id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
    }

    arancelamiento(turno) {
        this.showArancelamientoForm.emit(turno);
    }

    getPaciente() {
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
                    return (moment(t.horaInicio).isSameOrAfter(new Date(), 'day') && t.estado !== 'liberado');
                });

                this.ultimosTurnos = turnos.filter(t => {
                    return moment(t.horaInicio).isSameOrBefore(new Date(), 'day');
                });

            });
            if (this._paciente.contacto && this._paciente.contacto.length) {
                this.contactos = this._paciente.contacto.filter(contact => contact.tipo === 'celular' || contact.tipo === 'fijo');
            }
            // Se muestra la cantidad de turnos anulados
            let datosLog = { idPaciente: this._paciente.id, operacion: 'turnos:liberar' };
            this.serviceLogPaciente.get(datosLog).subscribe(logs => {
                if (logs && logs.length) {
                    this.anulaciones = logs.length;
                }
            });
        }
    }

    private sortTurnos(turnos) {
        turnos = turnos.sort((a, b) => {
            let inia = a.horaInicio ? new Date(a.horaInicio) : null;
            let inib = b.horaInicio ? new Date(b.horaInicio) : null;
            {
                return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
            }

        });
    }

    changeTab(event) {
        this.currentTab = event;
        if ((event === 2 || event === 1) && this._paciente && this._paciente.id) {
            this.updateHistorial();
        }
    }

    updateHistorial() {
        let cantInasistencias = 0;
        // Se muestra la cantidad de turnos otorgados e inasistencias
        this.serviceTurno.getHistorial({ pacienteId: this._paciente.id }).subscribe(turnos => {
            turnos.forEach(turno => {
                if (turno.asistencia && turno.asistencia === 'noAsistio') {
                    cantInasistencias++;
                }

            });

            this.turnosOtorgados = turnos.length;
            this.inasistencias = cantInasistencias;
            this.sortTurnos(turnos);
            this.turnosPaciente = turnos.filter(t => {
                return (moment(t.horaInicio).isSameOrAfter(new Date(), 'day') && t.estado !== 'liberado');
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
}
