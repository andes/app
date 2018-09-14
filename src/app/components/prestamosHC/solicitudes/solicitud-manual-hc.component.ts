import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { EspacioFisicoService } from '../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from './../../../interfaces/IPaciente';
import { PacienteService } from '../../../services/paciente.service';



@Component({
    selector: 'solicitud-manual-hc',
    templateUrl: './solicitud-manual-hc.component.html'
})

export class SolicitudManualComponent implements OnInit {
    private _carpeta: any;
    public prestacionesPermisos = [];
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
    pacientesSearch = true;

    @Input('pacienteSeleccionado')
    set pacienteSeleccionado(value: any) {
        this.paciente = value;
        this.obtenerCarpetaPaciente();
        this.solicitud = {};
        this.solicitud.organizacion = this.auth.organizacion;
        this.solicitud.paciente = this.paciente;
        this.solicitud.numero = this.carpetaEfector.nroCarpeta;
        this.solicitud.fecha = new Date;
    }

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public servicioPrestacion: TipoPrestacionService,
        public servicioEspacioFisico: EspacioFisicoService,
        public servicioProfesional: ProfesionalService,
        public servicePaciente: PacienteService,
        public auth: Auth) {
    }

    ngOnInit() {

    }

    loadPrestaciones(event) {
        if (this.prestacionesPermisos && this.prestacionesPermisos[0] !== '*') {
            this.servicioPrestacion.get({
                id: this.prestacionesPermisos
            }).subscribe(event.callback);
        } else {
            this.servicioPrestacion.get({
                turneable: 1
            }).subscribe(event.callback);
        }
    }

    loadEspacios(event) {
        let listaEspaciosFisicos = [];
        if (event.query) {
            let query = {
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
            let query = {
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

    save(event) {
        this.solicitud.datosSolicitudManual = {
            espacioFisico: this.espacioFisico,
            prestacion: this.tipoPrestacion,
            profesional: this.profesional,
            observaciones: this.observaciones,
            responsable: this.auth.usuario
        };
        this.prestamosService.solicitudManualCarpeta(this.solicitud).subscribe(solicitud => {
            this.plex.toast('success', 'La solicitud de carpeta se creó correctamente', 'Información', 1000);
            this.cancelSolicitudManualEmit.emit(true);
            this.nuevaCarpetaManualEmit.emit(true);
        });
    }

    cancel() {
        this.cancelSolicitudManualEmit.emit(false);
    }

    // Se busca el número de carpeta de la Historia Clínica en papel del paciente
    // a partir del documento y del efector
    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this.paciente.carpetaEfectores.length > 0) {
            // Filtro por organizacion
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicePaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                }
            });
        }
    }
}

