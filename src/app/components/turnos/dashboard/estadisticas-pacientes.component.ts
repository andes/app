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
    pacienteFields = ['sexo', 'fechaNacimiento', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    nroCarpeta: any;
    _paciente: IPaciente;
    turnosPaciente: any;
    ultimosTurnos: any;
    pacienteSeleccionado: IPaciente;
    fechaDesde: any;
    fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    idOrganizacion = this.auth.organizacion.id;
    carpetaEfector: any;
    currentTab = 0;
    @Input() showTab: Number = 0;
    @Input('paciente')
    set paciente(value: any) {
        this.pacienteSeleccionado = value;
        this._paciente = value;
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

    updateHistorial() {
        if (this._paciente && this._paciente.id) {
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
                this.turnosPaciente = turnos.filter(t => moment(t.horaInicio).isSameOrAfter(new Date(), 'day') && t.estado !== 'liberado');
                this.ultimosTurnos = turnos.filter(t => moment(t.horaInicio).isSameOrBefore(new Date(), 'day'));
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
        if (this._paciente && this._paciente.id) {
            if (event === 1 || event === 2) {
                this.updateHistorial();
            }
        }
    }

}
