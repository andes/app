import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { environment } from '../../../environments/environment';
import { WebSocketService } from '../../services/websocket.serivice';
@Component({
    templateUrl: 'login.html',
    styleUrls: ['login.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class LoginComponent implements OnInit {
    public usuario: number;
    public password: string;
    public loading = false;
    public deshabilitar = false;
    public autoFocus = 1;
    public versionAPP = environment.version;

    constructor(private plex: Plex, private auth: Auth, private router: Router, public ws: WebSocketService) { }

    ngOnInit() {
        this.auth.logout();
        this.ws.close();
    }


    login(event) {
        if (event.formValid) {
            this.deshabilitar = true;
            this.loading = true;
            this.auth.login(this.usuario.toString(), this.password)
                .subscribe((data) => {
                    this.plex.updateUserInfo({ usuario: this.auth.usuario });
                    this.router.navigate(['selectOrganizacion']);

                    this.ws.setToken(window.sessionStorage.getItem('jwt'));
                    // this.ws.emitAuth();

                }, (err) => {
                    this.plex.info('danger', 'Usuario o contraseña incorrectos');
                    this.loading = false;
                    this.deshabilitar = false;
                });
        }
    }


}
