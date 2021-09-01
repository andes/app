import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';



@Component({
    selector: 'solicitud-manual-hc',
    templateUrl: './solicitud-manual-hc.component.html'
})

export class SolicitudManualComponent {
    private _carpeta: any;
    public espacioFisico = null;
    public tipoPrestacion: any;
    public profesional: any;
    public observaciones: any;
    paciente: IPaciente;
    solicitud: any;
    carpetaEfector: any;
    tieneCarpeta = false;

    @Output() cancelSolicitudManualEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() nuevaCarpetaManualEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() crearNuevaCarpetaEmmiter: EventEmitter<any> = new EventEmitter<any>();

    pacientesSearch = true;

    @Input('pacienteSeleccionado')
    set pacienteSeleccionado(value: any) {
        this.paciente = value;
        this.searchPaciente(this.paciente);
    }

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public servicePaciente: PacienteService,
        public serviceCarpetaPaciente: CarpetaPacienteService,
        public auth: Auth) {
    }
    loadEspacios(event) {
        let listaEspaciosFisicos = [];
        if (event.query) {
            const query = {
                nombre: event.query,
                organizacion: this.auth.organizacion.id
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                if (this.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.espacioFisico.concat(resultado) : this.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.espacioFisico || []);
        }
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.espacioFisico || []);
        }
    }

    searchPaciente(paciente) {
        if (paciente && paciente.id) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.obtenerCarpetaPaciente(() => {
                        this.solicitud = {};
                        this.solicitud.organizacion = this.auth.organizacion;
                        this.solicitud.paciente = this.paciente;
                        this.solicitud.numero = this.carpetaEfector.nroCarpeta;
                        this.solicitud.fecha = new Date;
                    });
                }
            );
        }
    }

    save() {
        this.solicitud.datosSolicitudManual = {
            espacioFisico: this.espacioFisico,
            prestacion: this.tipoPrestacion,
            profesional: this.profesional,
            observaciones: this.observaciones,
            responsable: this.auth.usuario
        };
        this.prestamosService.solicitudManualCarpeta(this.solicitud).subscribe(solicitud => {
            this.plex.toast('success', 'La solicitud de carpeta se creó correctamente', 'Información', 1000);
            this.nuevaCarpetaManualEmit.emit(true);
        });
    }

    cancel() {
        this.cancelSolicitudManualEmit.emit(false);
    }

    /**
     * Se busca el número de carpeta de la Historia Clínica en papel del paciente encontrado en MPI
     * a partir del documento y del efector
     * Si no hay carpeta en el paciente MPI, se busca la carpeta en colección carpetaPaciente, usando el nro. de documento
     * @memberof PrestamosHcComponent
     */
    obtenerCarpetaPaciente(cb: any) {
        if (this.paciente.carpetaEfectores) {
            this.carpetaEfector = this.paciente.carpetaEfectores.find(e => (e.organizacion as any)._id === this.auth.organizacion.id);
            if (!this.carpetaEfector) {
                this.serviceCarpetaPaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpetas => {
                    if (carpetas.length > 0) {
                        const _carpetaEfector = carpetas[0].carpetaEfectores.find((ce: any) => ce.organizacion._id === this.auth.organizacion.id);
                        if (_carpetaEfector.nroCarpeta) {
                            this.carpetaEfector = _carpetaEfector;
                            cb();
                        }
                    } else {
                        this.plex.confirm('El paciente ' + this.paciente.apellido + ', ' + this.paciente.nombre + '<br> no posee una carpeta en esta Institución. <br> ¿Desea crear una nueva carpeta?').then((confirmar) => {
                            if (confirmar) {
                                this.crearNuevaCarpetaEmmiter.emit(true);
                            } else {
                                this.cancelSolicitudManualEmit.emit(true);
                            }
                        });
                    }
                });
            } else {
                cb();
            }
        } else {
            this.plex.toast('success', 'Ocurrió un error y no encontramos la historia clínica. Intertar nuevamente', 'Información', 1000);
        }
    }
}

