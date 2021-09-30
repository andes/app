import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Auth } from '@andes/auth';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'pdp-login-portal',
    templateUrl: './login-portal-paciente.component.html',
    styleUrls: ['./login-portal-paciente.scss']
})
export class LoginComponent implements OnInit {

    public usuario: string;
    public password: string;
    public loading = false;
    public activacion = false;

    @ViewChild('formulario', { static: true }) formulario: NgForm;

    constructor(
        private plex: Plex,
        private router: Router,
        private auth: Auth) { }

    ngOnInit() {
        this.auth.logout();
    }

    login() {
        if (this.formInvalid) {
            return false;
        }
        this.loading = true;
        this.usuario = this.usuario.toLocaleLowerCase();
        this.auth.mobileLogin(this.usuario, this.password).pipe(
            catchError(err => {
                this.loading = false;
                if (err === 'new_password_needed') {
                    this.goTo('reset-password');
                } else {
                    this.plex.info('danger', 'Usuario o contraseña incorrectos');
                }
                return null;
            }),
            map(() => this.router.navigate(['/mi-inicio']))
        ).subscribe();
    }

    get formInvalid() {
        return !this.formulario.form.valid || (!this.usuario || !this.password);
    }

    activar() {
        this.usuario = '';
        this.password = '';
        this.formulario.form.markAsPristine();
        this.activacion = !this.activacion;
    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id], {
                queryParams: {
                    email: this.usuario
                }
            });
        }
    }
}
