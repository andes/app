import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PerfilesHttp } from '../services/perfiles.http';
import { Plex } from '@andes/plex';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { of } from 'rxjs';
import { PermisosService } from '../services/permisos.service';
import { ArbolPermisosComponent } from './arbol-permisos/arbol-permisos.component';

@Component({
    selector: 'gestor-usarios-perfiles-detail',
    templateUrl: 'perfiles-detail.html'
})

export class PerfilDetailComponent implements OnInit {
    @ViewChild(ArbolPermisosComponent, { static: false }) arbol: ArbolPermisosComponent;

    public canGlobal = this.auth.check('global:usuarios:perfiles:write');
    public perfil = null;
    public esGlobal = false;

    public permisos$;

    constructor(
        public perfilesHttp: PerfilesHttp,
        public plex: Plex,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        public auth: Auth,
        private permisosService: PermisosService
    ) {

    }

    guardar() {
        this.perfil.permisos = this.arbol.getPermisos();
        this.perfil.organizacion = !this.esGlobal ? this.auth.organizacion.id : null;
        this.perfilesHttp.save(this.perfil).subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route, replaceUrl: true });
            this.plex.toast('success', 'El perfil se ha guardado satisfactoriamente!');
            this.perfilesHttp.reset();
        });
    }

    cancelar() {
        this.router.navigate(['..'], { relativeTo: this.route, replaceUrl: true });
    }

    ngOnInit() {
        this.permisos$ = this.permisosService.get();

        this.route.params.pipe(
            map(params => params.id),
            switchMap(id => {
                if (id === 'create') {
                    // selct con ID nulll para poder desseleccionar elementos
                    return of({ nombre: '', organizacion: this.auth.organizacion.id, activo: true, permisos: [] });
                } else {
                    return this.perfilesHttp.select(id).pipe(
                        switchMap((perfil) => {
                            if (!perfil) {
                                return this.perfilesHttp.get(id);
                            } else {
                                return of(perfil);
                            }
                        })
                    );
                }
            }),
            tap((perfil: any) => {
                this.perfil = { ...perfil };
                this.esGlobal = !this.perfil.organizacion;
            }),
            catchError((err) => {
                this.cancelar();
                return of();
            })
        ).subscribe(() => { });
    }

}
