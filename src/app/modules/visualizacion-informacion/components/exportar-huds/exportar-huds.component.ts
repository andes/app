import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ExportHudsService } from '../../services/export-huds.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';


@Component({
    selector: 'app-exportar-huds',
    templateUrl: './exportar-huds.component.html'
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


    constructor(
        private plex: Plex,
        private exportHudsService: ExportHudsService,
        private auth: Auth,
        private router: Router,
        private motivoAccesoService: ModalMotivoAccesoHudsService) { }

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

    onSelect(paciente: IPaciente): void {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.motivoAccesoService.getAccessoHUDS(this.pacienteSelected).subscribe((motivo) => {
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

    exportar() {
        let params = {
            pacienteId: this.pacienteSelected.id,
            pacienteNombre: this.pacienteSelected.nombreCompleto,
            tipoPrestacion: this.prestacion ? this.prestacion.conceptId : null,
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            hudsCompleta: this.hudsCompleta
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
}
