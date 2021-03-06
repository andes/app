import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Auth } from '@andes/auth';

@Injectable()
export class RoutingGuard implements CanActivate {
    constructor(
        private auth: Auth,
        private router: Router
    ) { }

    canActivate() {
        if (this.auth.loggedIn()) {
            return true;
        }
        if (this.auth.getToken()) {
            const usuario = window.sessionStorage.getItem('user');
            this.auth.mobileUser = JSON.parse(usuario);
            return true;
        }
        if (!this.auth.loggedIn()) {
            this.router.navigate(['./login']);
            return false;
        }
        return true;
    }
}

