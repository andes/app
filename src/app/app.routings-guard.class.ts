import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { Auth } from '@andes/auth';

@Injectable()
export class RoutingGuard implements CanActivate {
    constructor(private auth: Auth, private router: Router) { }

    canActivate() {
        if (this.auth.loggedIn()) {
            return true;
        } else {
            this.router.navigate(['inicio']);
            return false;
        }
    }
}
