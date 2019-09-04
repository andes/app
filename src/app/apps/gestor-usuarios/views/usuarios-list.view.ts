import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, merge } from 'rxjs';
import { map, switchMap, tap, distinctUntilChanged, take, } from 'rxjs/operators';
import { Permisos2Service } from '../services/permisos.service';
import { UsuariosHttp } from '../services/usuarios.http';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Observe, asObject, mergeObject, notNull, onlyNull, distincObject, cache } from '@andes/shared';

@Component({
    selector: 'gestor-usarios-usuarios-list',
    templateUrl: 'usuarios-list.view.html'
})

export class UsuariosListComponent implements OnInit {

    constructor(
        private profesionalService: ProfesionalService,
        private organizacionService: OrganizacionService,
        public permisosService: Permisos2Service,
        public usuariosHttp: UsuariosHttp,
        public plex: Plex,
        private location: Location,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    search$: Observable<any>;
    @Observe({ distinc: true, debounce: 300 }) search: string;

    organizacion$: Observable<any>;
    @Observe({ distinc: true }) organizacion: any;

    public organizaciones = [];
    public usuarios$;


    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Gestor Usuarios'
        }, {
            name: 'Usuarios'
        }]);

        this.usuarios$ = this.permisosService.organizaciones({ admin: true }).pipe(
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
                    this.search$.pipe(asObject('search', t => t.length ? t : null)),
                    this.organizacion$.pipe(asObject('organizacion', t => t.id)),
                );
            }),
            mergeObject(),
            distincObject(),
            tap((params) => {
                this.router.navigate([], { relativeTo: this.route, queryParams: params, queryParamsHandling: 'merge' });
            }),
            switchMap((query: any) => {
                query = { ...query };
                if (query.search) {
                    query.search = '^' + query.search;
                }
                return this.usuariosHttp.find({ ...query, fields: '-password -permisosGlobales' });
            }),
            tap((users) => this.notFound = users.length === 0),
            tap(() => this.userSelected = null),
            cache()
        );

        this.userData$ = this.userSelected$.pipe(
            notNull(),
            distinctUntilChanged((a: any, b: any) => a.id === b.id),
            switchMap((user: any) => {
                return this.profesionalService.get({
                    documento: user.usuario
                });
            }),
            cache(),
            map((profesional: any) => {
                return { profesional: profesional.length ? profesional[0] : null };
            })
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
                    return user.organizaciones.filter(org => {
                        return this.organizaciones.find(o => o.id === org.id);
                    });
                } else {
                    return of([]);
                }
            }),
            cache()
        );
    }
    private notFound = true;
    get isNewDisabled() {
        return !/^\d{7,8}$/.test(this.search) || !this.notFound;

    }

    nuevo() {
        this.usuariosHttp.find({ usuario: this.search }).pipe(
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

            this.plex.toast('succes', 'Usuarios creado exitosamente!', 'asdasd');
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
