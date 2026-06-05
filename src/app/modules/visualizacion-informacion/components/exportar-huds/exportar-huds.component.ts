import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ExportHudsService } from '../../services/export-huds.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';


@Component({
    selector: 'app-exportar-huds',
    templateUrl: './exportar-huds.component.html',
})

export class ExportarHudsComponent implements OnInit {
    public resultadoBusqueda = null;
    public pacienteSelected = null;
    public fechaDesde: Date;
    public fechaHasta: Date;
    public prestacion;
    public hudsCompleta = false;
    public modalAccepted = false;
    public showLabel = true;
    public disabledDescarga = false;
    public completed = [];
    public pending = [];
    public turnosPrestaciones = false;
    public excluirVacunas;
    public excluirLaboratorio;


    constructor(
        private plex: Plex,
        private exportHudsService: ExportHudsService,
        private auth: Auth,
        private router: Router,
        private motivoAccesoService: ModalMotivoAccesoHudsService,
        private pacienteRestringido: PacienteRestringidoPipe) { }

    ngOnInit(): void {
        if (!this.auth.check('huds:exportarHuds')) {
            this.router.navigate(['inicio']);
        } else {
            this.plex.updateTitle([
                { route: '/', name: 'VISUALIZACIÓN DE INFORMACIÓN' },
                { name: 'Exportar HUDS' }
            ]);
            this.descargasPendientes();
        }
    }

    searchStart() {
        this.showLabel = false;
    }

    searchEnd(resultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
        this.pacienteSelected = '';
        this.modalAccepted = false;
        this.showLabel = true;
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.prestacion = null;
    }

    esPacienteRestringido(paciente: IPaciente) {
        return this.pacienteRestringido.transform(paciente);
    }

    onSelect(paciente: IPaciente): void {
        if (paciente) {
            if (this.esPacienteRestringido(paciente)) {
                this.plex.info('warning', 'No tiene permiso para ingresar a este paciente.', 'Atención');
            } else {
                this.pacienteSelected = paciente;
                this.motivoAccesoService.showMotivos(this.pacienteSelected).subscribe((motivo) => {
                    if (motivo) {
                        this.modalAccepted = true;
                        this.showLabel = false;
                    }
                },
                // Si viene error, segundo callback
                () => {
                    this.pacienteSelected = '';
                });
            }
        }
    }

    exportar() {
        const excluye = [];

        if (this.excluirLaboratorio) { excluye.push('4241000179101'); }
        if (this.excluirVacunas) { excluye.push('33879002'); }

        const params = {
            pacienteId: this.pacienteSelected.id,
            pacienteNombre: this.pacienteSelected.nombreCompleto,
            tipoPrestacion: this.prestacion ? this.prestacion.conceptId : null,
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            hudsCompleta: this.hudsCompleta,
            excluye
        };
        this.exportHudsService.peticionHuds(params).subscribe((res) => {
            if (res) {
                this.plex.toast('success', 'Su pedido esta siendo procesado', 'Información', 2000);
                this.descargasPendientes();
                this.onSearchClear();
            }
        });
    }

    descargasPendientes() {
        this.exportHudsService.pendientes({ id: this.auth.usuario.id }).subscribe((data) => {
            this.exportHudsService.hud$.next(data);
        });
    }

    cambiarHudsCompleta() {
        this.excluirLaboratorio = false;
        this.excluirVacunas = false;
    }
}
