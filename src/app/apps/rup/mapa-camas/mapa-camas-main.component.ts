import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-mapa-camas-main',
    templateUrl: './mapa-camas-main.component.html',
    styles: [`
        plex-modal main {
            min-height: 20vh;
        }
    `]
})

export class MapaCamasMainComponent implements OnInit {
    public perfiles = [
        { id: 'medica', label: 'Profesional a cargo' },
        { id: 'enfermeria', label: 'Enfermero' },
        { id: 'estadistica', label: 'Estadístico' },
        { id: 'interconsultores', label: 'Interconsultores' },
        { id: 'estadistica-v2', label: 'Estadístico (nuevo)' }
    ];
    constructor(
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        const ambito = this.route.snapshot.paramMap.get('ambito');
        const permisosInternacion = this.auth.getPermissions(`${ambito}:rol:?`);
        if (permisosInternacion[0] === '*' || permisosInternacion.length) {
            if (permisosInternacion.length === 1 && permisosInternacion[0] !== '*') {
                this.router.navigate([this.router.url, permisosInternacion[0]], { replaceUrl: true });
            } else {
                if (permisosInternacion[0] !== '*') {
                    this.perfiles = this.perfiles.filter(perfil => permisosInternacion.indexOf(perfil.id) !== -1);
                }
            }
        } else {
            this.router.navigate(['/inicio']);
        }
    }

    volver() {
        this.router.navigate(['/inicio']);
    }

    ingresar(perfil) {
        this.router.navigate([this.router.url, perfil], { replaceUrl: true });
    }
}
