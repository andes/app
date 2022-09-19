import { Component, OnInit } from '@angular/core';
import { PerfilesHttp } from '../services/perfiles.http';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';


@Component({
    selector: 'gestor-usarios-perfiles-list',
    templateUrl: 'perfiles-list.component.html'
})

export class PerfilListComponent implements OnInit {
    private selectedId;

    constructor(
        public perfilesHttp: PerfilesHttp,
        public plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private auth: Auth
    ) {

    }

    ngOnInit() {
        if (!(this.auth.check('usuarios:perfiles') || this.auth.check('global:usuarios:perfiles'))) {
            this.router.navigate(['inicio']);
        }
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Gestor Usuarios'
        }, {
            name: 'Perfiles'
        }]);
        this.perfilesHttp.search({ sort: 'nombre', activo: true });
    }

    select(perfil) {
        this.selectedId = perfil.id;
        this.router.navigate([perfil.id], { relativeTo: this.route, replaceUrl: true });
    }

    isSelected(perfil) {
        return this.selectedId === perfil.id;
    }

    remove(perfil) {
        this.perfilesHttp.delete(perfil.id).subscribe(() => {
            this.router.navigate(['.'], { relativeTo: this.route });
            this.plex.toast('success', 'El perfil se ha borrado satisfactoriamente!');
            this.perfilesHttp.reset();
        });
    }

    nuevo() {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    volver() {
        this.router.navigate(['../usuarios'], { relativeTo: this.route });
    }

    buscar(text) {
        const textoBusqueda = text.value && text.value.length ? text.value.trim() : '';
        // debugger;
        if (textoBusqueda.length > 0) {
            this.perfilesHttp.search({ nombre: '^' + text.value, sort: 'nombre', activo: true });
        } else {
            this.perfilesHttp.search({ sort: 'nombre', activo: true });
        }
    }
}
