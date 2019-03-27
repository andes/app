import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

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

    constructor(
        public plex: Plex,
        public auth: Auth,
        private router: Router
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
        if (paciente && paciente.id) {
            this.router.navigate(['/rup/huds/paciente/' + paciente.id]);
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
    }
}

