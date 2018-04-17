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

    public _paciente: IPaciente;
    @Input('paciente')
    set paciente(value: any) {
        this.turnosOtorgados = 0;
        this.inasistencias = 0;
        this.anulaciones = 0;
        this.pacienteSeleccionado = value;
        this._paciente = value;
        this.servicePaciente.getById(this.pacienteSeleccionado.id).subscribe(
            pacienteMPI => {
                this._paciente = pacienteMPI;
                let datosTurno = { pacienteId: this._paciente && this._paciente.id ? this._paciente.id : null };
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

                if (this._paciente && this._paciente.id) {
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
    get agenda(): any {
        return this._paciente;
    }
    pacienteSeleccionado: IPaciente;
    public fechaDesde: any;
    public fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    anulaciones = 0;
    idOrganizacion = this.auth.organizacion.id;
    nuevaCarpeta = '';
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
    }

    getNroCarpeta() {
        if (this._paciente && this._paciente.carpetaEfectores && this._paciente.carpetaEfectores.length > 0) {
            let resultado: any = this._paciente.carpetaEfectores.filter((carpeta: any) => {
                return (carpeta.organizacion._id === this.idOrganizacion && carpeta.nroCarpeta !== null);
            });
            return resultado[0].nroCarpeta;
        } else {
            return null;
        }
    }

    nuevoNroCarpeta() {
        if (this.nuevaCarpeta !== '') {
            this.servicePaciente.patch(this._paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this._paciente.carpetaEfectores }).subscribe(
                resultadoCarpeta => {
                    this.carpetaEfector = {
                        organizacion: {
                            _id: this.auth.organizacion.id,
                            nombre: this.auth.organizacion.nombre
                        },
                        nroCarpeta: this.nuevaCarpeta
                    };
                    this._paciente.carpetaEfectores.push(this.carpetaEfector);
                    this.plex.alert('Nro. de carpeta Asignado', 'Información');
                },
                error => { this.plex.toast('danger', 'No se asignó el Nro. de carpeta, intente nuevamente.'); }
            );
        }
    }
}
