import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, merge, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, distinctUntilChanged, take, } from 'rxjs/operators';
import { PermisosService } from '../services/permisos.service';
import { UsuariosHttp } from '../services/usuarios.http';
import { Observe, asObject, mergeObject, onlyNull, cache } from '@andes/shared';
import { Auth } from '@andes/auth';

@Component({
    selector: 'gestor-usarios-usuarios-list',
    templateUrl: 'usuarios-list.view.html'
})

export class UsuariosListComponent implements OnInit {

    constructor(
        public permisosService: PermisosService,
        public usuariosHttp: UsuariosHttp,
        public plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private auth: Auth
    ) {
    }

    public verPerfiles = this.auth.check('usuarios:perfiles:?') || this.auth.check('global:usuarios:perfiles:?');
    public readOnly = !this.auth.check('usuarios:write');

    refresh = new BehaviorSubject({});
    refresh$ = this.refresh.asObservable();

    search$: Observable<any>;
    @Observe({ distinc: true, debounce: 300 }) search: string;

    organizacion$: Observable<any>;
    @Observe({ distinc: true }) organizacion: any;

    public organizaciones = [];
    public usuarios$;
    public organizacionesConPermisos = [];

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Gestor Usuarios'
        }, {
            name: 'Usuarios'
        }]);
        this.usuarios$ = this.permisosService.organizaciones().pipe(
            tap(orgs => this.organizaciones = orgs),
            switchMap(() => {
                return this.route.queryParams.pipe(
                    take(1),
                    tap(({ search, organizacion }) => {
                        if (search) {
                            this.search = search;
                        }
                        if (organizacion) {
                            this.organizacion = this.organizaciones.find(org => org.id === organizacion);
                        }
                    })
                );
            }),
            switchMap(() => {
                return merge(
                    this.refresh$,
                    this.search$.pipe(asObject('search', t => t.length ? t : null)),
                    this.organizacion$.pipe(asObject('organizacion', t => t.id)),
                );
            }),
            mergeObject(),
            tap((params) => {
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: params,
                    queryParamsHandling: 'merge',
                    replaceUrl: true
                });
            }),
            switchMap((query: any) => {
                query = { ...query };
                if (query.search) {
                    query.search = '^' + query.search;
                }
                return this.usuariosHttp.find({ ...query, fields: '-password -permisosGlobales', limit: 50 });
            }),
            tap(() => this.userSelected = null),
            cache()
        );

        this.organizacionesParaAgregar$ = this.userSelected$.pipe(
            map((user: any) => {
                if (user) {
                    return this.organizaciones.filter(org => {
                        return !user.organizaciones.find(o => o.id === org.id);
                    });
                } else {
                    return of([]);

                }
            }),
            cache()
        );

        this.orgList$ = this.userSelected$.pipe(
            map((user: any) => {
                if (user) {
                    this.organizacionesConPermisos = user.organizaciones.filter(org => {
                        return this.organizaciones.find(o => o.id === org.id);
                    });
                    return user.organizaciones;
                } else {
                    return of([]);
                }
            }),
            cache()
        );
    }

    get isNewDisabled() {
        return !/^\d{7,8}$/.test(this.search);

    }

    nuevo() {
        this.plex.confirm('¿Querés dar de alta el usuario?', 'ALTA DE USUARIO').then((resultado) => {
            if (resultado) {
                this.usuariosHttp.find({ documento: this.search }).pipe(
                    map(users => users.length > 0),
                    tap((found) => {
                        if (found) {
                            this.plex.info('error', 'El usuario existe');
                        }
                    }),
                    onlyNull(),
                    switchMap(() => {
                        return this.usuariosHttp.ldap(this.search);
                    }),
                    switchMap((user) => {
                        return this.usuariosHttp.create(user);
                    })
                ).subscribe((user) => {
                    this.plex.toast('success', 'Usuarios creado exitosamente!');
                    this.organizacion = null;
                    this.refresh.next({});
                });
            }
        });
    }

    toogleActivo(org) {
        this.usuariosHttp.updateOrganizacion(this.userSelected.usuario, org.id, { activo: !org.activo }).subscribe(() => {
            org.activo = !org.activo;
        });
    }

    public userData$;

    @Observe() userSelected;
    private userSelected$;

    select(user) {
        this.showNewOrgView = false;
        this.userSelected = user;
    }

    edit(org) {
        this.router.navigate([this.userSelected.usuario], {
            relativeTo: this.route,
            queryParams: { organizacion: org.id }
        });
    }

    public orgList$;
    public organizacionesParaAgregar$;
    orgSelected = null;
    showNewOrgView = false;

    toogleAddOrg() {
        this.showNewOrgView = !this.showNewOrgView;
    }

    addOrgPermiso() {
        const body = {
            permisos: [],
            perfiles: [],
            nombre: this.orgSelected.nombre,
            id: this.orgSelected.id,
            _id: this.orgSelected.id
        };
        return this.usuariosHttp.addOrganizacion(this.userSelected.usuario, this.orgSelected.id, body).subscribe(() => {
            this.plex.toast('success', 'Organizacion agregada exitosamente!');
            this.router.navigate([this.userSelected.usuario], {
                relativeTo: this.route,
                queryParams: { organizacion: this.orgSelected.id }
            });
        });
    }

    toPerfiles() {
        this.router.navigate(['../perfiles'], { relativeTo: this.route });
    }

}
