import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Auth } from '@andes/auth';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class InicioComponent implements OnInit {
    public usuario: number;
    public password: string;
    public organizacion: any;
    private permisoAgendas = false;

    constructor(private plex: Plex, private auth: Auth) {}

    ngOnInit() {
        if ( this.auth.loggedIn() ) {
            this.permisoAgendas = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;
        }
    }

    login(event) {
        if (event.formValid) {
            this.auth.login(this.usuario.toString(), this.password, this.organizacion.id)
                .subscribe((data) => {
                    this.password = null;
                    this.permisoAgendas = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;
                }, (err) => {
                    this.plex.alert('Usuario o contraseña incorrectos');
                });
        }
    }

    logout(event) {
        // TODO
    }

    loadOrganizaciones(event) {
        this.auth.organizaciones().subscribe(event.callback);
    }

}
