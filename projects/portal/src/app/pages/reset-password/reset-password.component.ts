import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, catchError, switchMap } from 'rxjs/operators';

@Component({
    selector: 'pdp-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    email: string;
    password: string;
    new_password: string;
    confirm_password: string;
    public esRegistro = false;
    public loading = false;
    public formRegistro: any;
    public titulo: string;
    public mensaje = '';
    constructor(private plex: Plex, private auth: Auth, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.esRegistro = params.registro;
            this.email = params.email;
            this.formRegistro = this.formBuilder.group({
                email: ['', !this.esRegistro && Validators.required],
                password: ['', !this.esRegistro && Validators.required],
                new_password: ['', Validators.required],
                confirm_password: ['', Validators.required],
            });
        });
        if (this.esRegistro) {
            this.titulo = '¡Bienvenido a Andes!';
            this.mensaje = 'Para finalizar tu activación, es necesario que crees una con-\ntraseña. ';
        } else {
            this.titulo = 'Establecer nueva contraseña';
        }
    }

    sendDataPass() {
        if (this.new_password !== this.confirm_password) {
            this.plex.info('warning', 'Las contraseñas no coinciden');
        } else {
            let call;
            if (this.esRegistro) {
                call = this.auth.mobileLogin(this.email, this.password, this.new_password);
            } else {
                call = this.auth.resetMobilePassword(this.email, this.password, this.new_password, this.confirm_password).pipe(
                    switchMap(resp => {
                        if (resp?.valid && !this.auth.loggedIn()) {
                            return this.auth.mobileLogin(this.email, this.new_password);
                        }
                        return resp;
                    })
                );
            }
            call.subscribe(() => {
                this.loading = false;
                this.router.navigate(['mis-relaciones']);
            }, err => {
                this.loading = false;
                this.plex.info('warning', err.error || 'Ocurrió un error. Por favor intentalo nuevamente.');
            });
        }

    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id]);
        }
        this.router.navigate(['login']);
    }

}
