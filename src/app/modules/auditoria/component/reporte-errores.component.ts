import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { LogPacienteService } from 'src/app/services/logPaciente.service';
import { ModalCorreccionPacienteComponent } from './modal-correccion-paciente.component';

@Component({
    selector: 'reporte-errores',
    templateUrl: 'reporte-errores.html'
})

export class ReporteErroresComponent implements OnInit {

    @ViewChild('modalCorreccion') modalCorreccion: ModalCorreccionPacienteComponent;
    @Output() selected = new EventEmitter<any>();

    showSidebar = false;
    filtroPaciente: string;
    pacientesReportados = [];
    corregirPaciente: Number;
    showReporteError = false; // se muestra en el sidebar datos del error reportado
    permisoEdicion: Boolean;
    permisoVincular: Boolean;
    pacienteSelected: IPaciente;
    reportes = [];
    pacientes = [];

    constructor(
        public auth: Auth,
        private plex: Plex,
        private pacienteService: PacienteService,
        private logPacienteService: LogPacienteService) { }

    ngOnInit() {
        this.permisoEdicion = this.auth.check('auditoriaPacientes:edicion');
        this.permisoVincular = this.auth.check('auditoriaPacientes:vincular');

        forkJoin([
            this.pacienteService.get({ reportarError: true, activo: true }), // pacientes
            this.logPacienteService.get({ operacion: 'error:reportar' }) // registros de errores reportados
        ]).subscribe(respuesta => {
            if (respuesta?.length) {
                this.pacientesReportados = respuesta[0];
                this.corregirPaciente = null;
                const erroresReportados = respuesta[1];
                this.pacientesReportados.forEach(pac => {
                    this.reportes[pac.id] = erroresReportados.filter((reg: any) => reg.paciente.id === pac.id);
                });
            }
            this.pacientes = this.pacientesReportados;
        });
    }

    onSelect(paciente: IPaciente) {
        if (paciente) {
            this.pacienteSelected = paciente;
            const listadoReportes = this.reportes[paciente.id];
            this.selected.emit({ paciente, listadoReportes });
        }
    }

    corregirError() {
        if (this.permisoEdicion) {
            this.modalCorreccion.show();
        } else {
            this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
        }
    }

    filtrarPaciente() {
        const resultados = this.pacientesReportados.filter((paciente: IPaciente) => {
            const data = (paciente.nombre + paciente.apellido + paciente.documento).toLowerCase();
            const filtros = (this.filtroPaciente || '').toLowerCase().split(' ');

            return filtros.every(item => data.includes(item));
        });

        this.pacientes = this.filtroPaciente && this.filtroPaciente.length ? resultados : this.pacientesReportados;
    }

    savePatient(paciente: IPaciente) {
        // si el paciente no debe ser modificado (cancelar) entonces es paciente=null
        if (paciente) {
            paciente.reportarError = false;
            paciente.notaError = '';
            if (!paciente.tipoIdentificacion) {
                paciente.tipoIdentificacion = null;
            }
            this.pacienteService.save(paciente).subscribe((respSave: any) => {

                if (respSave && !respSave.errors) {
                    // Si el matcheo es alto o el dni-sexo está repetido no se permite guardar el paciente
                    if (respSave.macheoAlto && respSave.dniRepetido) {
                        this.plex.info('danger', 'Existen pacientes similares, el paciente no puede ser modificado hasta que sea vinculado');
                    } else {
                        this.pacienteSelected = respSave;
                        this.plex.toast('success', 'Los datos se actualizaron correctamente!');
                    }

                } else {
                    this.plex.toast('danger', 'No es posible actualizar el paciente');
                }
            });
        }
    }
}
