import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Auth } from '@andes/auth';

@Component({
    selector: 'pdp-recuperar-contraseña',
    templateUrl: './recuperar-contraseña.component.html',
    styleUrls: ['../login/login-portal-paciente.scss']
})
export class RecuperarContraseñaComponent implements OnInit {

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
            this.auth.resetMobilePassword(this.usuario).subscribe(resp => {
                this.loading = false;
                if (resp.valid) {
                    this.plex.toast('success', 'El código fue enviado correctamente a tu correo', 'Confirmación', 5000);
                }
            }, error => {
                this.loading = false;
                this.plex.info('warning', 'El e-mail ingresado no existe o venció el plazo para activar tu cuenta. Debes registrarte nuevamente.', 'Hay un problema');
            });
        }
    }
}
