import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';

const limit = 25;

@Component({
    selector: 'organizaciones',
    templateUrl: 'organizacion.html',
})
export class OrganizacionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    showcreate = false;
    datos: IOrganizacion[] = [];
    seleccion: IOrganizacion;
    skip = 0;
    nombre = '';
    soloNoActivo = false;
    loader = false;
    finScroll = false;
    tengoDatos = true;

    constructor(
        public organizacionService: OrganizacionService,
        private auth: Auth,
        private router: Router,
        private plex: Plex
    ) { }

    ngOnInit() {
        if (this.auth.getPermissions('tm:organizacion:?').length < 1) {
            this.router.navigate(['inicio']);
        } else {
            this.updateTitle('Organizaciones');
            this.loadDatos();
        }
    }


    private updateTitle(nombre: string) {
        this.plex.updateTitle('Tablas maestras / ' + nombre);
    }

    checkAuth(permiso, id) {
        return this.auth.check('tm:organizacion:' + permiso + (id ? ':' + id : ''));
    }

    loadDatos(concatenar: boolean = false) {
        let parametros = {
            activo: !this.soloNoActivo,
            nombre: this.nombre,
            skip: this.skip,
            limit: limit,
            user: this.auth.usuario.username
        };
        this.organizacionService.get(parametros)
            .subscribe(
                datos => {
                    if (concatenar) {
                        if (datos.length > 0) {
                            this.datos = this.datos.concat(datos);
                        } else {
                            this.finScroll = true;
                            this.tengoDatos = false;
                        }
                    } else {
                        this.datos = datos;
                        this.finScroll = false;
                    }
                    this.loader = false;
                });
    }

    onReturn(): void {
        this.updateTitle('Organizaciones');
        this.showcreate = false;
        this.seleccion = null;
        this.loadDatos();
    }

    activate(objOrganizacion: IOrganizacion) {
        if (objOrganizacion.activo) {

            this.organizacionService.disable(objOrganizacion)
                .subscribe(dato => this.loadDatos()); // Bind to view
        } else {
            this.organizacionService.enable(objOrganizacion)
                .subscribe(dato => this.loadDatos()); // Bind to view
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

    nextPage() {
        if (this.tengoDatos) {
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
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

    aplicarFiltroBusqueda() {
        this.skip = 0;
        this.loadDatos(false);
    }
}
