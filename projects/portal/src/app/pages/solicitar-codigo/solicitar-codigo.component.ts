import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Auth } from '@andes/auth';

@Component({
    selector: 'pdp-solicitar-codigo',
    templateUrl: './solicitar-codigo.component.html',
    styleUrls: ['../login/login-portal-paciente.scss']
})
export class SolicitarCodigoComponent implements OnInit {

    public usuario: string;
    public loading = false;

    @ViewChild('formulario', { static: true }) formulario: NgForm;

    constructor(
        private plex: Plex,
        private router: Router,
        private auth: Auth
    ) { }


    ngOnInit() {
        this.auth.logout();
    }

    volverLogin() {
        this.router.navigate(['/login']);
    }

    enviarCodigo() {
        if (this.usuario.length) {
            this.loading = true;
            this.auth.sendCode(this.usuario, 'PDP').subscribe(resp => {
                this.loading = false;
                if (resp.valid) {
                    this.router.navigate(['reset-password'], {
                        queryParams: {
                            email: this.usuario
                        }
                    });
                }
            }, error => {
                this.loading = false;
                this.plex.info('warning', 'El e-mail ingresado no existe o venció el plazo para activar tu cuenta. Debes registrarte nuevamente.', 'Hay un problema');
            });
        }
    }
}
