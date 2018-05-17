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
    pacienteSeleccionado: IPaciente;
    public fechaDesde: any;
    public fechaHasta: any;
    turnosOtorgados = 0;
    inasistencias = 0;
    anulaciones = 0;
    idOrganizacion = this.auth.organizacion.id;
    nuevaCarpeta = '';
    editando = false;
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

    getPaciente() {
        this.servicePaciente.getById(this.pacienteSeleccionado.id).subscribe(
            pacienteMPI => {
                this._paciente = pacienteMPI;
                let datosTurno = { pacienteId: this._paciente && this._paciente.id ? this._paciente.id : null };
                let cantInasistencias = 0;
                // Se muestra la cantidad de turnos otorgados e inasistencias
                this.serviceTurno.getTurnos(datosTurno).subscribe(turnos => {
                    turnos.forEach(turno => {
                        if (turno.asistencia && turno.asistencia === 'noAsistio') {
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
                this.obtenerCarpetaPaciente();
            });
    }

    editarNroCarpeta() {
        this.editando = true;
    }

    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this._paciente.carpetaEfectores.length > 0) {
            // Filtro por organizacion
            indiceCarpeta = this._paciente.carpetaEfectores.findIndex((x) => (x.organizacion as any)._id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this._paciente.carpetaEfectores[indiceCarpeta];
                this.nroCarpeta = this._paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
            }
        }

        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicePaciente.getNroCarpeta({ documento: this._paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                    this.getPaciente();
                }
            });
        }
    }

    nuevoNroCarpeta() {
        if (this.nuevaCarpeta !== '') {
            this.carpetaEfector = {
                organizacion: {
                    _id: this.auth.organizacion.id,
                    nombre: this.auth.organizacion.nombre
                },
                nroCarpeta: this.nuevaCarpeta
            };
            let indiceCarpeta = this._paciente.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this._paciente.carpetaEfectores[indiceCarpeta] = this.carpetaEfector;
            } else {
                this._paciente.carpetaEfectores.push(this.carpetaEfector);
            }
            this.servicePaciente.patch(this._paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this._paciente.carpetaEfectores }).subscribe(
                resultadoCarpeta => {
                    this.nroCarpeta = this.nuevaCarpeta;
                    this.plex.alert('Nro. de carpeta Asignado', 'Información');
                    this.editando = false;
                },
                error => {
                    this.plex.toast('danger', 'No se asignó el Nro. de carpeta, intente nuevamente.');
                    this.editando = false;
                }
            );
        }
    }
}
