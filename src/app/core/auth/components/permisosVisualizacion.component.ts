import { UsuarioService } from './../../../services/usuarios/usuario.service';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
import { Component, Input, OnInit } from '@angular/core';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';

@Component({
    selector: 'permisosVisualizacion',
    templateUrl: 'permisosVisualizacion.html'
})
export class PermisosVisualizacionComponent implements OnInit {
    /**
     * Usuario seleccionado para visualizar sus permisos
     * @memberof PermisosVisualizacionComponent
     */
    @Input()
    get user() {
        return this.usuario;
    }
    set user(value) {
        this.usuario = {} as any;
        Object.assign(this.usuario, value);
        // if (this.organizacion) {
        //     this.obtenerPermisosUsuario(this.usuario, this.organizacion);
        // }
    }
    /**
     * Organización seleccionada para visualizar los permisos en el prestador
     * @type {IOrganizacion}
     * @memberof PermisosVisualizacionComponent
     */
    @Input()
    get org() {
        return this.organizacion;
    }
    set org(value: IOrganizacion) {
        this.organizacion = {} as any;
        Object.assign(this.organizacion, value);
        this.cargar();
    }

    /**
     * Arreglo de los perfiles de usuario globales y los locales para la organización
     * @type {IPerfilUsuario[]}
     * @memberof PermisosVisualizacionComponent
     */
    perfilesOrganizacion: IPerfilUsuario[];

    /**
     * Arreglo con todos los permisos del usuario para la organización seleccionada
     * Ejemplo: ['mpi:*', 'internacion:*']
     * @type {string[]}
     * @memberof PermisosVisualizacionComponent
     */
    public permisosUsuarioOrg: string[];

    public usuario = null;
    public organizacion: IOrganizacion = null;
    constructor(private perfilUsuarioService: PerfilUsuarioService, private usuarioService: UsuarioService) { }

    ngOnInit() {
        // this.obtenerPermisosUsuario(this.usuario, this.organizacion);

    }
    async cargar() {
        if (this.usuario) {
            try {
                await this.obtenerPermisosUsuario(this.usuario, this.organizacion);
            } catch (err) {
                return err;
            }
            this.obtenerPerfiles(this.organizacion);
        }
    }
    /**
     * Recupera de la base de datos todos los perfiles asociados a la organización
     * @param {IOrganizacion} org
     * @memberof PermisosVisualizacionComponent
     */
    obtenerPerfiles(org: IOrganizacion) {
        this.perfilUsuarioService.get({ idOrganizacion: org ? org.id : null }).subscribe(res => {
            this.perfilesOrganizacion = res;
        });
    }

    /**
     * Indica si el usuario tiene asignado cada uno de los permisos que incluye el perfil
     * @param {IPerfilUsuario} perfil
     * @returns {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    tienePerfilAsignado(perfil: IPerfilUsuario): boolean {

        if (this.permisosUsuarioOrg && this.permisosUsuarioOrg.length) {
            let i = 0;
            let encontroPermiso = false;
            let cumpleTodosLosPermisos = true;
            while (i < perfil.permisos.length && cumpleTodosLosPermisos) {
                let permisoPerfilDividido = perfil.permisos[i].split(':');
                let permisoEncontrado = this.permisosUsuarioOrg.find((permisoUsuario: any) => {
                    return permisoUsuario === perfil.permisos[i] || this.esUsuarioMayorCategoriaPerfil(permisoPerfilDividido, permisoUsuario.split(':'));
                });
                if (!permisoEncontrado) {
                    cumpleTodosLosPermisos = false;
                }
                i++;
            }
            return cumpleTodosLosPermisos;
        }
    }

    /**
     * Devuelve si el permiso del perfil es de menor categoría que el perfil asignado del usuario
     * Ejemplos:
     * esUsuarioMayorCategoriaPerfil('turnos:puedeEditar', 'turnos:*')                ->  True
     * esUsuarioMayorCategoriaPerfil('mpi:paciente:dashboard', 'mpi:*')               ->  True
     * esUsuarioMayorCategoriaPerfil('turnos:*', 'turnos:puedeSuspender')             ->  False
     * esUsuarioMayorCategoriaPerfil('mpi:paciente:deleteAndes', 'internacion:censo') ->  False
     *
     * @private
     * @param {string[]} arrayPerfil cada celda es una key de los permisos
     * @param {string[]} arrayUsuario cada celda es una key de los permisos
     * @returns {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    private esUsuarioMayorCategoriaPerfil(arrayPerfil: string[], arrayUsuario: string[]): boolean {
        if (arrayPerfil.length < arrayUsuario.length) {
            return false;
        }
        let i = 0;
        let bandera = true;
        while (i < arrayUsuario.length && bandera) {
            if (arrayPerfil[i] !== arrayUsuario[i] && arrayUsuario[i] !== '*') {
                bandera = false;
            }
            i++;
        }
        return bandera;
    }
    obtenerPermisosUsuario(usuario, organizacion: IOrganizacion) {
        if (usuario && organizacion) {
            this.usuarioService.getByDniOrg({ dni: usuario.nombre, idOrganizacion: organizacion.id }).subscribe(res => {
                this.permisosUsuarioOrg = res;
            });
        }
    }
}
