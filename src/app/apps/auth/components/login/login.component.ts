import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { WebSocketService } from '../../../../services/websocket.service';

@Component({
    templateUrl: 'login.html',
    styleUrls: ['login.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class LoginComponent implements OnInit {
    public usuario: number;
    public password: string;
    public loading = false;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public ws: WebSocketService
    ) { }

    ngOnInit() {
        this.auth.logout();
        this.ws.close();
    }

    checkTimezone() {
        const timeZone = new Date().getTimezoneOffset();
        return timeZone === 180;
    }

    login(event) {
        if (!this.checkTimezone()) {
            this.plex.info('danger', 'La hora de la computadora es incorrecta. Chequea el huso horario.');
            return;
        }
        if (event.formValid) {
            this.loading = true;
            this.auth.login(this.usuario.toString(), this.password)
                .subscribe((data) => {
                    this.ws.setToken(window.sessionStorage.getItem('jwt'));
                    this.router.navigate(['/auth/select-organizacion']);
                }, (err) => {
                    this.plex.info('danger', 'Usuario o contraseña incorrectos');
                    this.loading = false;
                });
        }
    }

}
