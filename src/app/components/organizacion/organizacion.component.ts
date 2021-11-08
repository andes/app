import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'organizaciones',
    templateUrl: 'organizacion.html',
})
export class OrganizacionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    showcreate = false;
    listado$: Observable<IOrganizacion[]>;
    listadoActual: IOrganizacion[];
    seleccion: IOrganizacion;
    loader = true;
    filtros: any = {};
    queryParams = {
        skip: 0,
        limit: 15
    };
    public columns = [
        {
            key: 'codigoSisa',
            label: 'Código Sisa',
            sorteable: true,
            opcional: false,
            sort: (a, b) => { return a.codigo.sisa.localeCompare(b.codigo.sisa); }
        },
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            opcional: false,
            sort: (a, b) => { return a.nombre.localeCompare(b.nombre); }
        },
        {
            key: 'Complejidad',
            label: 'complejidad',
            sorteable: false,
            opcional: false,
            sort: (a, b) => { return null; }
        },
        {
            key: 'Estado',
            label: 'estado',
            sorteable: true,
            opcional: false,
            sort: (a, b) => { return a.estado.localeCompare(b.estado); }
        },
        {
            key: 'Acciones',
            label: 'acciones',
            sorteable: false,
            opcional: false,
            sort: (a, b) => { return null; }
        }
    ];

    constructor(
        public organizacionService: OrganizacionService,
        private auth: Auth,
        private router: Router,
        private plex: Plex
    ) { }

    ngOnInit() {
        if (this.auth.getPermissions('tm:organizacion:?').length < 1) {
            this.router.navigate(['inicio']);
        }
        this.updateTitle('Organizaciones');
        this.listado$ = this.organizacionService.organizacionesFiltradas$.pipe(
            map(resp => {
                this.listadoActual = resp;
                this.loader = false;
                return resp;
            })
        );
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle('Tablas maestras / ' + nombre);
    }

    checkAuth(permiso, id) {
        return this.auth.check('tm:organizacion:' + permiso + (id ? ':' + id : ''));
    }

    onScroll() {
        this.organizacionService.lastResults.next(this.listadoActual);
    }

    filtrar() {
        this.organizacionService.lastResults.next(null);
        this.organizacionService.nombre.next(this.filtros.nombre);
        this.organizacionService.soloNoActivo.next(this.filtros.soloNoActivo);
    }

    onReturn(): void {
        this.updateTitle('Organizaciones');
        this.loader = true;
        this.showcreate = false;
        this.seleccion = null;
        this.organizacionService.lastResults.next(null);
    }

    activate(objOrganizacion: IOrganizacion) {
        if (objOrganizacion.activo) {

            this.organizacionService.disable(objOrganizacion)
                .subscribe(() => this.organizacionService.lastResults.next(null)); // Bind to view
        } else {
            this.organizacionService.enable(objOrganizacion)
                .subscribe(() => this.organizacionService.lastResults.next(null)); // Bind to view
        }
    }

    onEdit(objOrganizacion: IOrganizacion) {
        this.showcreate = true;
        this.seleccion = objOrganizacion;
    }
    nuevaOrganizacion() {
        this.seleccion = null;
        this.showcreate = true;
    }

    routeSectores(org) {
        this.router.navigate(['/tm/organizacion/' + org.id + '/sectores']);
    }

    routePrestaciones(id) {
        this.router.navigate(['/tm/organizacion/' + id + '/ofertas_prestacionales']);
    }

    routerConfiguracion(id) {
        this.router.navigate(['/tm/organizacion/' + id + '/configuracion']);
    }

    routerConfiguracionInternacion(id) {
        this.router.navigate(['/tm/organizacion/' + id + '/configuracion_internacion']);
    }
}
