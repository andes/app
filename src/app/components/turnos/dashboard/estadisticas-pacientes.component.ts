import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { LogPacienteService } from '../../../services/logPaciente.service';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { IFinanciador } from '../../../interfaces/IFinanciador';

@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html'
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
    obraSocial: IFinanciador;
    currentTab = 0;
    historialCargado = false;

    @Input() showTab: Number = 0;
    @Input('paciente')
    set paciente(value: any) {
        this.pacienteSeleccionado = value;
        this._paciente = value;

    }
    get agenda(): any {
        return this._paciente;
    }

    @Output() showArancelamientoForm = new EventEmitter<any>();
    @Output() obraSocialEmit = new EventEmitter<any>();

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public plex: Plex,
        public auth: Auth,
        public serviceLogPaciente: LogPacienteService,
        private obraSocialService: ObraSocialService) { }

    ngOnInit() {
        this.carpetaEfector = {
            organizacion: {
                id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.getPaciente();
        this.loadObraSocial();
    }

    loadObraSocial() {
        // TODO: si es en colegio médico hay que buscar en el paciente
        this.obraSocialService.getPaciente({ dni: this._paciente.documento, sexo: this._paciente.sexo }).subscribe(resultado => {
            if (resultado.length) {
                this.obraSocial = resultado[0];
                this.obraSocialEmit.emit(this.obraSocial);
            }
        });
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
            });
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
}
