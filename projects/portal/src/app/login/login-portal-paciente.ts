import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { LoginService } from './service/login-portal-paciente.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-portal',
    templateUrl: 'login-portal-paciente.component.html'
})
export class LoginComponent implements OnInit {

    public usuario: string;
    public password = '';
    dniRegex = /^[0-9]{7,8}$/;
    public loading = false;
    public showModalResetPassword = false;
    public showModalRegisterUser = false;
    inProgress = false;
    constructor(private plex: Plex,
        private router: Router,
        private loginService: LoginService) { }
    email;

    ngOnInit() {

    }

    login() {
        if (!this.usuario || !this.password) {
            this.plex.toast('danger', 'Complete los datos para ingresar.');
            return;
        }
        this.usuario = this.usuario.toLocaleLowerCase();
        if (!this.dniRegex.test(this.usuario)) {
            // Login pacientes
            const credentials = {
                email: this.usuario,
                password: this.password
            };
            this.inProgress = true;
            this.loginService.login(credentials).subscribe(res => {
                this.router.navigateByUrl('/home');
            },
                (err) => {
                    this.plex.info('danger', 'Usuario o contraseña incorrectos');
                    this.loading = false;
                });

        } else {
            this.plex.toast('danger', 'usuario incorrecto');
        }
    }
}
