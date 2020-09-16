import { OnInit, Component, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { map, pluck, switchMap, tap, publishReplay, refCount, delay, takeUntil } from 'rxjs/operators';
import { UsuariosHttp } from '../services/usuarios.http';
import { Observable, forkJoin, BehaviorSubject, Subject } from 'rxjs';
import { OrganizacionService } from '../../../services/organizacion.service';
import { PerfilesHttp } from '../services/perfiles.http';
import { PermisosService } from '../services/permisos.service';
import { ArbolPermisosComponent } from '../components/arbol-permisos/arbol-permisos.component';
import { Observe } from '@andes/shared';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';


function elementAt(index = 0) {
    return map((array: any[]) => array.length ? array[0] : null);
}

@Component({
    selector: 'gestor-usarios-usuarios-edit',
    templateUrl: 'usuarios-edit.view.html'
})
export class UsuariosEditComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    @ViewChild(ArbolPermisosComponent, { static: true }) arbol: ArbolPermisosComponent;
    private userId = '';
    public organizacionId = '';
    public orgName = '';

    public user$: Observable<any>;

    public permisos$: Observable<any>;
    @Observe({ initial: [] }) permisos;

    public perfiles = [];
    public arbolPermisos = [];

    public habilitados = {};

    constructor(
        private location: Location,
        private router: Router,
        public plex: Plex,
        private auth: Auth,
        private route: ActivatedRoute,
        public usuariosHttp: UsuariosHttp,
        private organizacionService: OrganizacionService,
        public perfilesHttp: PerfilesHttp,
        public permisosService: PermisosService
    ) { }



    getOrganizacion() {
        return this.organizacionService.getById(this.organizacionId);
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Gestor Usuarios'
        }, {
            name: 'Edición usuario'
        }]);
        this.route.params.pipe(
            pluck('id'),
            tap((id: any) => this.userId = id),
            switchMap(() => {
                return this.route.queryParams;
            }),
            pluck('organizacion'),
            tap((id: any) => this.organizacionId = id),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.user$ = this.usuariosHttp.get(this.userId).pipe(
                publishReplay(1),
                refCount()
            );


            forkJoin(
                this.perfilesHttp.find().pipe(tap(perfiles => {
                    this.permisos$.pipe(delay(1), takeUntil(this.destroy$)).subscribe((permisos) => {
                        perfiles.forEach(perfil => {
                            const enabled = this.perfilesHttp.validatePerfil(permisos, perfil);
                            this.tooglePerfil(perfil, enabled);
                        });
                        this.perfiles = perfiles;
                    });
                })),
                this.user$.pipe(
                    tap(user => {
                        const orgPermisos = user.organizaciones.find(org => org.id === this.organizacionId);
                        if (orgPermisos) {
                            this.orgName = orgPermisos.nombre;
                            this.permisos = orgPermisos.permisos;
                        }
                    })
                ),
                this.permisosService.get().pipe(tap(permisos => this.arbolPermisos = permisos))
            ).pipe(takeUntil(this.destroy$)).subscribe(() => { });
        });
    }

    tooglePerfil(perfil, enabled) {
        this.habilitados[perfil.id] = enabled;
    }

    grabar() {
        const body = {
            permisos: this.arbol.getPermisos(),
            id: this.organizacionId,
            nombre: this.orgName,
            perfiles: this.perfiles.filter(p => this.habilitados[p.id]).map(p => {
                return {
                    _id: p.id,
                    nombre: p.nombre
                };
            })
        };
        this.usuariosHttp.updateOrganizacion(this.userId, this.organizacionId, body).subscribe(() => {
            this.plex.toast('success', 'Permisos grabados exitosamente!');
            this.location.back();
        });
    }

    borrar() {
        return this.usuariosHttp.deleteOrganizacion(this.userId, this.organizacionId).subscribe(() => {
            this.plex.toast('success', 'Permisos eliminados exitosamente!');
            this.location.back();
        });
    }

    onChangePerfil($event, perfilSelected) {
        const added = $event.value;
        const permisos = [...this.permisos];
        if (added) {
            this.tooglePerfil(perfilSelected, true);
            perfilSelected.permisos.forEach(p => permisos.push(p));
            this.permisos = permisos;
        } else {
            this.tooglePerfil(perfilSelected, false);
            this.perfiles.forEach(perfil => {
                for (let i = 0; i < permisos.length; i++) {
                    const pass = this.perfilesHttp.validatePermiso(perfil.permisos, permisos[i]);
                    if (pass) {
                        permisos.splice(i, 1);
                        i--;
                    }
                }
            });
            this.perfiles.filter(p => p.id !== perfilSelected.id && this.habilitados[p.id])
                .reduce((acc, val) => acc.concat(val.permisos), [])
                .forEach(p => permisos.push(p));
            this.permisos = permisos;
        }
    }

    copy() {
        this.permisosService.copy(this.permisos);
    }

    paste() {
        this.permisos = this.permisosService.paste();
    }

    volver() {
        this.location.back();
        // this.router.navigate(['..'], { relativeTo: this.route });
    }
}
