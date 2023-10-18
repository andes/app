import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { Location } from '@angular/common';

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
    // public motivoAccesoHuds;
    showModalMotivo = false;
    pacienteSelected = null;

    constructor(
        private location: Location,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private hudsService: HUDSService
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

        if (!this.auth.check('huds:visualizacionHuds')) {
            this.router.navigate(['inicio']);
        }
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

    onSelect(paciente: IPaciente): void {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.showModalMotivo = true;
        }
    }

    onConfirmSelect(motivoAccesoHuds) {
        if (motivoAccesoHuds) {
            // se obtiene token y loguea el acceso a la huds del paciente
            const paramsToken = {
                usuario: this.auth.usuario,
                organizacion: this.auth.organizacion,
                paciente: this.pacienteSelected,
                motivo: motivoAccesoHuds,
                profesional: this.auth.profesional ? this.auth.profesional : null,
                idTurno: null,
                idPrestacion: null
            };
            this.hudsService.generateHudsToken( paramsToken).subscribe(hudsToken => {
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

