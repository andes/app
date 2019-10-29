import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';

@Component({
    selector: 'rup-hudsBusquedaPaciente',
    templateUrl: 'hudsBusquedaPaciente.html',
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaPacienteComponent implements OnInit {

    public esProfesional = false;
    // ---- Variables asociadas a componentes paciente buscar y paciente listado
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;
    routeParams: any;
    public motivoAccesoHuds;

    constructor(
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

        if (!this.auth.profesional && this.auth.getPermissions('huds:?').length <= 0) {
            this.router.navigate(['inicio']);
        }
        // se obtiene el motivo de acceso a la huds que seleccionó el profesional
        this.motivoAccesoHuds = localStorage.getItem('motivoAccesoHuds');
        if (!this.motivoAccesoHuds) {
            this.router.navigate(['rup']);
        }
    }

    onCancel() {
        this.router.navigate(['rup']);
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
        this.resultadoBusqueda = [];
        if (paciente && paciente.id && this.motivoAccesoHuds) {
            // se obtiene token y loguea el acceso a la huds del paciente
            this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, this.motivoAccesoHuds, this.auth.profesional.id, null, null).subscribe(hudsToken => {
                localStorage.setItem('hudsToken', hudsToken);
                localStorage.removeItem('motivoAccesoHuds');
                this.router.navigate(['/rup/huds/paciente/' + paciente.id]);
            });
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
    }
}

