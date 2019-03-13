import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from './../../../../interfaces/IPaciente';

@Component({
    selector: 'rup-hudsBusquedaPaciente',
    templateUrl: 'hudsBusquedaPaciente.html',
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaPacienteComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    public paciente: IPaciente;


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

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    onPacienteSelected(paciente) {
        this.router.navigate(['/rup/huds/paciente/' + paciente.id]);
    }

    onPacienteCancel() {
        this.router.navigate(['rup']);
    }

}
