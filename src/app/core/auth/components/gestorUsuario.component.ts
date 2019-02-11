import { Plex } from '@andes/plex';
import { UsuarioService } from './../../../services/usuarios/usuario.service';
import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ArbolPermisosComponent } from './../../../components/usuario/arbolPermisos.component';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IPermiso } from './../interfaces/IPermiso';
import { PermisosService } from '../../../services/permisos.service';
import { agregarPermiso, quitarPermiso } from '../controllers/permisos';
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
    public permisosUsuarioOrg: string[];

    /**
     * Permisos del usuario como los tiene en la base de datos
     * @private
     * @type {string[]}
     * @memberof GestorUsuarioComponent
     */
    private permisosUsuarioOrgOriginal: string[];
    public permisos$: any;
    public permisos: any[] = [];

    /**
     * Todos los permisos posibles de ser asignados. Cada uno de los elementos del arreglo son hijos del
     * nodo raíz (sin padre realmente, los módulos que aparecen en el árbol de permisos )
     * @type {IPermiso[]}
     * @memberof GestorUsuarioComponent
     */
    public arbolPermisosCompleto: IPermiso[];
    constructor(private permisosService: PermisosService, private usuarioService: UsuarioService, private plex: Plex) { }
    ngOnInit() {
        this.permisos$ = this.permisosService.get();
        this.usuarioService.permisos().subscribe(res => { this.arbolPermisosCompleto = res; });
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
                this.permisosUsuarioOrgOriginal = res;
            });
        }
    }

    /**
     * Guarda la edición de permisos de un usuario, para la organización seleccionada
     * @param {*} event
     * @memberof GestorUsuarioComponent
     */
    guardar(event) {
        this.plex.confirm('Se guardará el usuario con los siguientes permisos: \n' + this.permisosUsuarioOrg +
            '\n ¿Desea continuar?', 'Aceptar').then((confirmar: boolean) => {
                if (confirmar) {
                    this.savePermisos();
                    this.usuarioService.save(this.usuarioSeleccionado).subscribe();
                    this.cambio(0);
                }
            });
    }

    /**
     * Cancela la edición de permisos de un usuario para la organización seleccionada
     * @memberof GestorUsuarioComponent
     */
    cancelar() {
        this.permisosUsuarioOrg = this.permisosUsuarioOrgOriginal;
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
        let indiceOrg = this.usuarioSeleccionado.organizaciones.findIndex((item) => item.id === this.organizacionSeleccionada.id);
        if (indiceOrg === -1) {
            indiceOrg = this.usuarioSeleccionado.organizaciones.length - 1;
        }
        this.usuarioSeleccionado.organizaciones[indiceOrg].permisos = [...this.permisos];

    }

    /**
     * Sincroniza los permisos de los perfiles con los del árbol de permisos
     * @param {{ checked: boolean, permisos: string[] }} event
     * @memberof GestorUsuarioComponent
     */
    seleccionPerfil(event: { checked: boolean, permisos: string[] }) {
        this.permisosUsuarioOrg = [...event.permisos];
    }

    /**
     * Sincroniza los permisos del árbol de permisos con los perfiles
     * @param {{ checked: boolean, permiso: IPermiso }} event
     * @memberof GestorUsuarioComponent
     */
    seleccionPermiso(event: { checked: boolean, permiso: IPermiso }) {
        console.log('Gestor antes de obtener permiso nuevo: ', this.permisosUsuarioOrg, '  Permiso nuevo: ', event.permiso);
        let arrayPermiso: string[] = [];
        arrayPermiso.push(event.permiso.child ? event.permiso.key + ':*' : event.permiso.key);
        this.permisosUsuarioOrg = event.checked ? agregarPermiso(this.permisosUsuarioOrg, arrayPermiso) : quitarPermiso(this.permisosUsuarioOrg, arrayPermiso, this.arbolPermisosCompleto);
        console.log('Gestor obtuvo permisos nuevos: ', this.permisosUsuarioOrg);
    }
}

