import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

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
    activo = true;
    loader = false;
    finScroll = false;
    tengoDatos = true;

    constructor(private formBuilder: FormBuilder,
        public organizacionService: OrganizacionService,
        private auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {
        this.updateTitle('Organizaciones');
        this.loadDatos();
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle('Tablas maestras / ' + nombre);
    }

    checkAuth(permiso, id) {
        return this.auth.check('tm:organizacion:' + permiso + (id ? ':' + id : ''));
    }

    loadDatos(concatenar: boolean = false) {
        let parametros = {
            activo: this.activo,
            nombre: this.nombre,
            skip: this.skip,
            limit: limit
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

    onReturn(objOrganizacion: IOrganizacion): void {
        this.updateTitle('Organizaciones');
        this.showcreate = false;
        this.seleccion = null;
        this.loadDatos();
    }

    // onDisable(objOrganizacion: IOrganizacion) { // no se esta usando en ningun lado 14/03/2019
    //     this.organizacionService.disable(objOrganizacion)
    //         .subscribe(dato => this.loadDatos()); // Bind to view
    // }

    // onEnable(objOrganizacion: IOrganizacion) { // no se esta usando en ningun lado 14/03/2019
    //     this.organizacionService.enable(objOrganizacion)
    //         .subscribe(dato => this.loadDatos()); // Bind to view
    // }

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

    nextPage() {
        if (this.tengoDatos) {
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
    }
    routeSectores(id) {
        this.router.navigate(['/tm/organizacion/' + id + '/sectores']);
    }

    aplicarFiltroBusqueda() {
        this.skip = 0;
        this.loadDatos(false);
    }
}
