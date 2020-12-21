import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { WebSocketService } from '../../../../services/websocket.service';


@Component({
    templateUrl: 'forgot.html',
    styleUrls: ['forgot.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ForgotComponent {
    public usuario: number;
    public loading = false;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public ws: WebSocketService
    ) { }



    recover(event) {
        if (event.formValid) {
            this.loading = true;
            this.auth.setValidationTokenAndNotify(this.usuario).subscribe(
                data => {
                    if (data.status === 'ok') {
                        this.plex.info('success', 'Hemos enviado un e-mail para regenerar su contraseña');
                        this.loading = false;
                    } else {
                        this.loading = false;
                        this.plex.confirm('¿Desea continuar?', 'Su operación deberá ser realizada desde oneLogin.').then((resultado) => {
                            if (resultado) {
                                window.location.href = 'https://cas.neuquen.gov.ar/cas/login?service=https%3a%2f%2flogin.neuquen.gov.ar%2f';
                            } else {
                                this.cancel();
                            }
                        });

                    }
                    this.cancel();
                },
                err => {
                    this.plex.info('danger', 'El usuario ingresado no existe. Verifique los datos ingresados y vuelva a intentar');
                    this.loading = false;
                    this.cancel();
                }
            );
        }
    }

    cancel() {
        this.router.navigate(['/auth/login']);
    }

}
