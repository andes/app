import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Injectable()
export class RoutingGuard implements CanActivate {
    constructor(private auth: Auth, private router: Router, private plex: Plex) { }

    canActivate() {
        if (this.auth.loggedIn()) {
            this.plex.updateUserInfo({ usuario: this.auth.usuario, organizacion: this.auth.organizacion });
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
}
