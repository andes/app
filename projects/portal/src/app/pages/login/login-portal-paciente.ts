import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'pdp-login-portal',
    templateUrl: 'login-portal-paciente.component.html'
})
export class LoginComponent implements OnInit {

    public usuario: string;
    public password: string;
    public loading = false;

    constructor(
        private plex: Plex,
        private router: Router,
        private auth: Auth) { }

    ngOnInit() {
        this.auth.logout();
    }

    login() {
        if (!this.usuario || !this.password) {
            this.plex.toast('danger', 'Complete los datos para ingresar.');
            return;
        }
        this.loading = true;
        this.usuario = this.usuario.toLocaleLowerCase();
        this.auth.mobileLogin(this.usuario, this.password).pipe(
            catchError(err => {
                this.plex.info('danger', 'Usuario o contraseña incorrectos');
                this.loading = false;
                return null;
            }),
            map(() => this.router.navigate(['/mis-familiares']))
        ).subscribe();
    }
}
