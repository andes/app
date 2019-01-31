import { UsuarioService } from './../../../services/usuarios/usuario.service';
import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ArbolPermisosComponent } from './../../../components/usuario/arbolPermisos.component';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { PermisosService } from '../../../services/permisos.service';
@Component({
    selector: 'gestorUsuario',
    templateUrl: 'gestorUsuario.html'
})
export class GestorUsuarioComponent implements OnInit {
    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    /**
     * Usuario al que se desea ver o editar los permisos
     * @memberof GestorUsuarioComponent
     */
    usuarioSeleccionado;
    /**
     * Organización a la que se desea ver o editar los permisos
     * @type {IOrganizacion}
     * @memberof GestorUsuarioComponent
     */
    organizacionSeleccionada: IOrganizacion;

    /**
      * Indica el índice de la pestaña que se encuentra activa. Por defecto es la primera
      *
      * @memberof GestorUsuarioComponent
      */
    public pestaniaActiva = 0;

    /**
     * Todos los permisos posibles que se pueden asignar a un usuario
     * @type {*}
     * @memberof GestorUsuarioComponent
     */
    /**
     * Permisos del usuario para la organización seleccionada
     * @type {any[]}
     * @memberof GestorUsuarioComponent
     */
    public permisosUsuarioOrg: any[];
    public permisos$: any;
    public permisos: any[] = [];

    constructor(private permisosService: PermisosService, private usuarioService: UsuarioService) { }
    ngOnInit() {
        this.permisos$ = this.permisosService.get();
    }

    /**
     * Indica qué pestaña se activó
     *
     * @param {number} value
     * @memberof GestorUsuarioComponent
     */
    public cambio(value: number) {
        this.pestaniaActiva = value;
    }

    seleccionUsuario(user) {
        this.usuarioSeleccionado = user;
    }

    seleccionOrganizacion(org: IOrganizacion) {
        this.organizacionSeleccionada = org;
        this.obtenerPermisosUsuario(this.usuarioSeleccionado, this.organizacionSeleccionada);
    }

    obtenerPermisosUsuario(usuario, organizacion: IOrganizacion) {
        if (usuario && organizacion) {
            this.usuarioService.getByDniOrg({ dni: usuario.nombre, idOrganizacion: organizacion.id }).subscribe(res => {
                this.permisosUsuarioOrg = res;
            });
        }
    }

    /**
     * Guarda la edición de permisos de un usuario, para la organización seleccionada
     * @param {*} event
     * @memberof GestorUsuarioComponent
     */
    guardar(event) {
        this.savePermisos();
        this.usuarioService.save(this.usuarioSeleccionado).subscribe();
        this.cambio(0);
    }

    /**
     * Guarda los permisos modificados del usuario, para la organización seleccionada
     * @memberof GestorUsuarioComponent
     */
    savePermisos() {
        this.permisos = [];
        this.childsComponents.forEach(child => {
            this.permisos = [...this.permisos, ...child.generateString()];
        });
        const indiceOrg = this.usuarioSeleccionado.organizaciones.findIndex((item) => item.id === this.organizacionSeleccionada.id);
        this.usuarioSeleccionado.organizaciones[indiceOrg].permisos = [...this.permisos];
    }
}
