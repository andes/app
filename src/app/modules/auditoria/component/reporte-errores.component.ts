import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { LogPacienteService } from 'src/app/services/logPaciente.service';
import { ModalCorreccionPacienteComponent } from './modal-correccion-paciente.component';

@Component({
    selector: 'reporte-errores',
    templateUrl: 'reporte-errores.html',
    styleUrls: ['reporte-errores.scss']
})

export class ReporteErroresComponent implements OnInit {

    @ViewChild('modalCorreccion') modalCorreccion: ModalCorreccionPacienteComponent;
    @Output() selected = new EventEmitter<any>();

    showSidebar = false;
    filtroPaciente: string;
    pacientesReportados = [];
    corregirPaciente: Number;
    showReporteError = false; // se muestra en el sidebar datos del error reportado
    permisoEdicion: boolean;
    permisoVincular: boolean;
    pacienteSelected: IPaciente;
    reportes = {};
    pacientes = [];

    // paginación infinite scroll
    loading = false;
    scrollEnd = false;
    skip = 0;
    readonly limit = 20;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private pacienteService: PacienteService,
        private logPacienteService: LogPacienteService) { }

    ngOnInit() {
        this.permisoEdicion = this.auth.check('auditoriaPacientes:edicion');
        this.permisoVincular = this.auth.check('auditoriaPacientes:vincular');
        this.cargar();
    }

    /**
     * Carga una página de pacientes con errores reportados y sus logs asociados.
     * @param reset si es true reinicia la lista (nueva búsqueda), si es false concatena (scroll)
     */
    cargar(reset = true) {
        if (this.loading || (this.scrollEnd && !reset)) { return; }

        if (reset) {
            this.pacientesReportados = [];
            this.pacientes = [];
            this.reportes = {};
            this.skip = 0;
            this.scrollEnd = false;
        }

        this.loading = true;
        const params: any = {
            reportarError: true,
            activo: true,
            skip: this.skip,
            limit: this.limit
        };
        if (this.filtroPaciente) {
            params.search = this.filtroPaciente;
        }

        this.pacienteService.get(params).subscribe((pacientesBatch: any[]) => {
            if (!pacientesBatch || !pacientesBatch.length) {
                this.scrollEnd = true;
                this.loading = false;
                return;
            }

            // Si vienen menos registros que el límite, ya llegamos al final
            if (pacientesBatch.length < this.limit) {
                this.scrollEnd = true;
            }

            const ids = pacientesBatch.map(p => p.id).join(',');

            // Pedimos los logs sólo de los pacientes de esta página
            this.logPacienteService.get({ ids, operacion: 'error:reportar' }).subscribe((logs: any[]) => {
                pacientesBatch.forEach(pac => {
                    this.reportes[pac.id] = (logs || []).filter((reg: any) => reg.paciente?.id === pac.id);
                });

                this.pacientesReportados = this.pacientesReportados.concat(pacientesBatch);
                this.skip = this.pacientesReportados.length;
                this.pacientes = this.pacientesReportados;
                this.loading = false;
            }, () => {
                // Si falla la carga de logs igual mostramos los pacientes
                this.pacientesReportados = this.pacientesReportados.concat(pacientesBatch);
                this.skip = this.pacientesReportados.length;
                this.pacientes = this.pacientesReportados;
                this.loading = false;
            });
        }, () => {
            this.loading = false;
        });
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.cargar(false);
        }
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
        this.cargar(true);
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
                        // recargamos la lista para reflejar el cambio
                        this.cargar();
                    }

                } else {
                    this.plex.toast('danger', 'No es posible actualizar el paciente');
                }
            });
        }
    }
}
