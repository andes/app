import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { Location } from '@angular/common';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';
import { IMotivoAcceso } from '../../interfaces/IMotivoAcceso';
import { PacientesConsentimientoService } from 'src/app/services/paciente-concentimiento.service';

@Component({
    selector: 'rup-hudsBusquedaPaciente',
    templateUrl: 'hudsBusquedaPaciente.html',
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaPacienteComponent implements OnInit {

    public esProfesional = false;
    // ---- Variables asociadas a componentes paciente buscar y paciente listado
    resultadoBusqueda = null;
    loading = false;
    routeParams: any;
    showModalMotivo = false;
    pacienteSelected = null;
    permisoProgramaMas65: boolean;
    consentimientoEncontrado: boolean;

    constructor(
        private location: Location,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private hudsService: HUDSService,
        private pacienteRestringido: PacienteRestringidoPipe,
        private pacientesConsentimientoService: PacientesConsentimientoService
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/rup',
            name: 'RUP'
        }, {
            name: 'BUSCAR PACIENTE'
        }]);

        const permisos = [
            'huds:visualizacionHuds',
            'huds:visualizacionParcialHuds:*',
            'huds:visualizacionParcialHuds:laboratorio',
            'huds:visualizacionParcialHuds:vacuna',
            'huds:visualizacionParcialHuds:receta'
        ];

        if (!permisos.some(permiso => this.auth.check(permiso))) {
            this.router.navigate(['inicio']);
        }

        this.permisoProgramaMas65 = this.auth.check('huds:programaMas65');
    }

    onCancel() {
        this.location.back();
    }

    searchStart() {
        this.loading = true;
    }

    searchEnd(resultado) {
        this.loading = false;
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
    }

    esPacienteRestringido(paciente: IPaciente) {
        return this.pacienteRestringido.transform(paciente);
    }

    onSelect(paciente: IPaciente): void {
        if (paciente) {
            if (this.esPacienteRestringido(paciente)) {
                this.plex.info('warning', 'No tiene permiso para ingresar a este paciente.', 'Atención');
            } else {
                if (this.permisoProgramaMas65) {
                    this.programaMas65(paciente);
                } else {
                    this.pacienteSelected = paciente;
                    this.showModalMotivo = true;
                }
            }
        }
    }

    programaMas65(paciente: IPaciente) {
        this.pacientesConsentimientoService.search({ pacienteId: paciente.id }).subscribe({
            next: (consentimiento: any) => {

                if (!consentimiento || (consentimiento.encontrado !== undefined && !consentimiento.encontrado)) {
                    this.plex.info('warning', 'Usted no posee permisos para visualizar la historia de ese paciente');
                    return;
                }

                const listado = Array.isArray(consentimiento) ? consentimiento : [consentimiento];
                const consentimientosCuidar65 = listado.filter((c: any) => c && c.programa === 'Cuidar65');

                if (consentimientosCuidar65.length === 0) {
                    this.plex.info('warning', 'Usted no posee permisos para visualizar la historia de ese paciente');
                    return;
                }

                // Ordenar por fechaResp descendente (el más reciente primero)
                consentimientosCuidar65.sort((a, b) => {
                    const dateA = a.fechaResp ? new Date(a.fechaResp).getTime() : 0;
                    const dateB = b.fechaResp ? new Date(b.fechaResp).getTime() : 0;
                    return dateB - dateA;
                });

                const masReciente = consentimientosCuidar65[0];

                if (masReciente.aceptacion) {
                    this.pacienteSelected = paciente;
                    this.showModalMotivo = true;
                } else {
                    this.plex.info('warning', 'Este paciente rechazo el programa "Cuidar + 65"');
                    return;
                }
            }
        });
    }

    onConfirmSelect(motivoAccesoHuds: IMotivoAcceso) {
        if (motivoAccesoHuds) {
            // se obtiene token y loguea el acceso a la huds del paciente
            const paramsToken = {
                usuario: this.auth.usuario,
                organizacion: this.auth.organizacion,
                paciente: this.pacienteSelected,
                motivo: motivoAccesoHuds.motivo,
                profesional: this.auth.profesional ? this.auth.profesional : null,
                idTurno: null,
                idPrestacion: null,
                detalleMotivo: motivoAccesoHuds.textoObservacion
            };
            this.hudsService.generateHudsToken(paramsToken).subscribe(hudsToken => {
                window.sessionStorage.setItem('huds-token', hudsToken.token);
                window.sessionStorage.removeItem('motivoAccesoHuds');
                this.router.navigate(['/huds/paciente/' + this.pacienteSelected.id]);
            });
        } else {
            this.pacienteSelected = null;
        }
        this.showModalMotivo = false;
    }
}

