import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { WebSocketService } from '../../../../services/websocket.service';
import { pluck, take } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
    templateUrl: 'login.html',
    styleUrls: ['login.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class LoginComponent implements OnInit {
    public usuario: number;
    public password: string;
    public loading = false;
    public redirectURL = null;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public ws: WebSocketService,
        private activeRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.auth.logout();
        this.ws.close();

        this.activeRoute.queryParams.pipe(
            pluck('redirect'),
            take(1)
        ).subscribe((url: string) => {
            if (environment.production) {
                // simple security check
                if (url.includes('andes.gob.ar')) {
                    this.redirectURL = url;
                }
            } else {
                this.redirectURL = url;
            }
        });
    }


    login(event) {
        if (event.formValid) {
            this.loading = true;
            this.auth.login(this.usuario.toString(), this.password)
                .subscribe((data) => {
                    this.plex.updateUserInfo({ usuario: this.auth.usuario });
                    this.ws.setToken(window.sessionStorage.getItem('jwt'));
                    this.router.navigate(['/auth/select-organizacion'], { queryParams: { redirect: this.redirectURL } });
                }, (err) => {
                    this.plex.info('danger', 'Usuario o contraseña incorrectos');
                    this.loading = false;
                });
        }
    }


}
