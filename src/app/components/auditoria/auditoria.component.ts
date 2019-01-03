import { Plex } from '@andes/plex';
import { Component, OnInit, Output } from '@angular/core';
import { PacienteService } from './../../services/paciente.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { SisaService } from '../../services/fuentesAutenticas/servicioSisa.service';
import { RenaperService } from '../../services/fuentesAutenticas/servicioRenaper.service';
import { PacienteBuscarResultado } from '../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'auditoria',
    templateUrl: 'auditoria.html',
})

export class AuditoriaComponent implements OnInit {

    @Output() patientToFix: any;
    @Output() patient: any;

    enableDuplicados: boolean;
    enableActivar: boolean;
    enableValidar: boolean;
    pacienteSelected: any;
    showDetallePaciente = false;
    enableVinculados = false;
    loading = false;
    showAuditoria = true;
    pacVinculados = [];
    public panelIndex = 0;
    private datosFA: any;
    pacientes: any;
    pacientesInactivos: any;
    pacienteActivo: any;
    showVincular = false;
    showCandidatos = false;
    enableVincular = false;
    showBuscador = false;
    showMensaje = false;
    constructor(
        public auth: Auth,
        private pacienteService: PacienteService,
        private servicioSisa: SisaService,
        private servicioRenaper: RenaperService,
        private agendaService: AgendaService,
        private plex: Plex,
        private router: Router,
    ) { }

    // Cargamos todos los pacientes temporales y activos
    ngOnInit() {
        if (this.auth.getPermissions('auditoriaPacientes:?').length < 1) {
            this.router.navigate(['./inicio']);
        }
        this.onLoadData();
    }

    onLoadData() {
        this.showDetallePaciente = false;
        this.enableVinculados = false;
    }

    getVinculados() {
        this.pacienteService.getAuditoriaVinculados(
            // { activo: true }
            {}).subscribe(resultado => {
                if (resultado) {
                    this.pacVinculados = resultado;
                }
            });
    }
    getInactivos() {
        this.pacienteService.getInactivos().subscribe(
            resultado => {
                this.pacientesInactivos = resultado;
            });

    }

    onSelect(paciente: any): void {
        this.pacienteActivo = this.patient = paciente;
        this.showCandidatos = false;
        // Vinculamos solo pacientes activos.
        this.enableVincular = paciente.activo;
        this.enableActivar = !paciente.activo;
        if (paciente && paciente.id) {
            this.pacienteService.getById(paciente.id).subscribe(pac => {
                this.pacienteSelected = pac;

                this.showDetallePaciente = true;
                if (this.pacienteSelected.estado !== 'validado') {
                    this.enableValidar = false;
                    this.enableDuplicados = false;
                } else {
                    this.enableValidar = false;
                    if (paciente.identificadores) {
                        let identificadoresAndes = paciente.identificadores.filter(identificador => {
                            return identificador.entidad === 'ANDES';
                        });
                        this.enableDuplicados = (identificadoresAndes.length > 0);
                    }
                }
            });
        }
    }

    checkPanel(panelIndex) {
        if (panelIndex === 1) {
            this.getVinculados();
        }
        if (panelIndex === 2) {
            this.getInactivos();
        }
        this.showDetallePaciente = false;
        this.enableActivar = false;
        this.enableVinculados = false;
        this.enableValidar = false;
        this.enableVincular = false;
        this.searchClear();
    }
    onSelectVinculados(paciente: any): void {
        if (paciente.id) {
            this.pacienteService.getById(paciente.id).subscribe(pac => {
                this.pacienteSelected = pac;
                this.showDetallePaciente = true;
                this.enableValidar = false;
                this.enableVinculados = true;
            });
        }
    }

    verDuplicados() {
        this.showAuditoria = false;
    }
    ocultarAuditoria() {
        this.showAuditoria = false;
    }

    validar(fuenteAutentica) {
        this.plex.showLoader();
        if (this.pacienteSelected.entidadesValidadoras.indexOf('sisa') < 0 && fuenteAutentica === 'sisa') {
            this.servicioSisa.get(this.pacienteSelected).subscribe(res => {
                this.verificarDatosFA(res, 'sisa');
                this.plex.hideLoader();
            });
        }
        if (this.pacienteSelected.entidadesValidadoras.indexOf('renaper') < 0 && fuenteAutentica === 'renaper') {
            this.servicioRenaper.get(this.pacienteSelected).subscribe(res => {
                this.verificarDatosFA(res, 'renaper');
                this.plex.hideLoader();
            });
        }
        if (this.pacienteSelected.estado !== 'validado') {
            if (this.datosFA && this.datosFA.matcheos && this.datosFA.matcheos.matcheo < 90) {
                this.checkPrestaciones();
            } else {
                this.rechazarValidacion();
            }
        }
    }


    operationLink(pacienteToFix, paciente) {
        this.patientToFix = pacienteToFix;
        this.patient = paciente;
        this.verDuplicados();
    }

    viewLinkedPatients(paciente) {
        this.verDuplicados();
        this.patient = paciente;
        this.patientToFix = null;
    }

    vincular() {
        if (!this.pacienteSelected) {
            return null;
        }
        this.showVincular = true;
        this.showAuditoria = false;
        this.router.navigate(['apps/mpi/auditoria/vincular-pacientes', { idPaciente: this.pacienteSelected.id }]);

    }

    cancelar() {
        this.showCandidatos = false;
        this.showBuscador = false;
        this.showMensaje = false;
    }


    checkPrestaciones() {
        this.agendaService.find(this.pacienteSelected.id).subscribe(data => {
            if (data.length < 1) {
                this.plex.confirm('¿Desea darlo de baja?', 'Paciente inactivo').then((confirmar) => {
                    if (confirmar) {
                        this.pacienteSelected.activo = false;
                    }
                    this.pacienteService.save(this.pacienteSelected).subscribe(res4 => {
                        // TODO ocultar info paciente y resetear campo busqueda
                    });
                });
            }
        });
    }

    rechazarValidacion() {
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('danger', '', 'Paciente no encontrado');
        });
    }

    verificarDatosFA(data, fa) {
        this.plex.hideLoader();
        // Registramos el intento de validación con cada fuente auténtica
        this.pacienteSelected.entidadesValidadoras.push(fa);
        this.datosFA = data;
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo === 100) {
            this.validarPaciente(fa);
            this.enableValidar = false;
            return true;
        }
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo >= 93 &&
            this.pacienteSelected.sexo === this.datosFA.matcheos.datosPaciente.sexo &&
            this.pacienteSelected.documento === this.datosFA.matcheos.datosPaciente.documento) {
            this.validarPaciente(fa);
            this.enableValidar = false;
            return true;
        } else {
            return false;
        }

    }

    validarPaciente(fa) {
        // No corregir el nombre con sintys ni anses porque
        // no tiene separado el nombre y el apellido
        if (fa === 'renaper') {
            this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
            this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
        }
        if (fa === 'sisa') {
            this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
            this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
        }
        this.pacienteSelected.fechaNacimiento = this.datosFA.matcheos.datosPaciente.fechaNacimiento;
        this.pacienteSelected.estado = 'validado';
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('success', '', 'Validación Exitosa');
        });
    }

    afterAuditoria(evento) {
        this.showAuditoria = true;
        this.showCandidatos = false;
        this.pacienteSelected = null;
        this.enableValidar = false;
        this.enableVincular = false;
        this.showBuscador = false;
        this.showMensaje = false;
        this.enableVinculados = false;
        this.searchClear();
        this.onLoadData();
    }

    searchStart() {
        this.pacientes = null;
        this.pacienteSelected = null;

    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            // Filtramos los pacientes que ya posean algo en el array de identificadores para evitar
            // anidamiento de linkeos
            this.pacientes = this.pacienteSelected ? resultado.pacientes.filter((pac: any) => (
                (this.pacienteSelected.id !== pac.id) && pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length < 1)) : resultado.pacientes;
        }
    }

    searchClear() {
        this.pacientes = null;
    }

    cancelVincular() {
        this.showVincular = false;
        this.showAuditoria = true;
        this.searchClear();

    }

    activar(pac: IPaciente, index: number) {
        this.pacienteService.enable(pac).subscribe(res => {
            this.plex.toast('success', 'Paciente Activado');
            this.getInactivos();
        });
    }
    desactivar(pac: IPaciente, index: number) {
        // si el paciente tiene otros pacientes en su array de identificadores, no lo podemos desactivar
        if (pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length > 0) {
            this.plex.info('warning', 'Existen otros pacientes vinculados a este paciente', 'No Permitido');
        } else {
            this.pacienteService.disable(pac).subscribe(res => {
                this.pacientes.splice(index, 1);
                this.pacienteSelected = null;
                this.plex.toast('info', 'Paciente Desactivado');
            });
        }
    }
}
