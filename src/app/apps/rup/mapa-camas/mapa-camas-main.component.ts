import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-mapa-camas-main',
    template: '',
})

export class MapaCamasMainComponent implements OnInit {
    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?');
        if (permisosInternacion.length === 1 && permisosInternacion[0] !== '*') {
            this.router.navigate([this.router.url, permisosInternacion[0]], { replaceUrl: true });
        } else {
            this.router.navigate(['/inicio']);
        }
    }
}
