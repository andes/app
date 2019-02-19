import { IPermiso } from './../interfaces/IPermiso';
import { UsuarioService } from './../../../services/usuarios/usuario.service';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';
import { agregarPermiso, quitarPermiso, esPermisoSubpermiso, obtenerPermisosParaMostrar } from '../controllers/permisos';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';

@Component({
    selector: 'permisosVisualizacion',
    templateUrl: 'permisosVisualizacion.html'
})
export class PermisosVisualizacionComponent {

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
     * Indica si el componente se usa solo para visualización o para asignar los permisos de cada perfil seleccionado
     * @type {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    @Input() permiteAsignarPerfiles: boolean;
    /**
     * Todo el árbol de permisos para mejorar la eficiencia en la asignación/revocación de perfiles al saber si los permisos son hojas o no dentro del árbol
     * @type {IPermiso[]}
     * @memberof PermisosVisualizacionComponent
     */
    @Input() arbolPermisosCompleto: IPermiso[];

    /**
     * Arreglo con todos los permisos del usuario para la organización seleccionada
     * Ejemplo: ['mpi:*', 'internacion:*']
     * @type {string[]}
     * @memberof PermisosVisualizacionComponent
     */
    @Input()
    get permisosUsuario(): string[] {
        return this.permisosUsuarioOrg;
    }
    set permisosUsuario(value: string[]) {
        this.permisosUsuarioOrg = value;
        this.tildarPerfilesCorrespondientes();
    }
    /**
     * Sirve para indicar que se deben asignar o quitar los permisos seleccionados
     * @memberof PermisosVisualizacionComponent
     */
    @Output() seleccionCheckboxPerfil = new EventEmitter<{ checked: boolean, permisos: string[] }>();
    // @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    /**
     * Arreglo con todos los permisos del usuario para la organización seleccionada
     * Ejemplo: ['mpi:*', 'internacion:*']
     * @type {string[]}
     * @memberof PermisosVisualizacionComponent
     */
    public permisosUsuarioOrg: string[];
    /**
     * Arreglo de los perfiles locales y globales de la organización junto con un booleano que indica
     * si el usuario dispone o no de todos los perfiles que implican el perfil
     * @private
     * @type {[{IPerfilUsuario, boolean}]}
     * @memberof PermisosVisualizacionComponent
     */
    public perfilesOrganizacion: { perfil: IPerfilUsuario, checked: boolean, permisos: string }[] = [];

    public usuario = null;
    public organizacion: IOrganizacion = null;

    constructor(private perfilUsuarioService: PerfilUsuarioService, private usuarioService: UsuarioService, private servicioTipoPrestacion: TipoPrestacionService) { }
    async cargar() {
        if (this.usuario) {
            this.obtenerPerfilesActivos(this.organizacion);
        }
    }
    /**
     * Recupera de la base de datos todos los perfiles asociados a la organización
     * @param {IOrganizacion} org
     * @memberof PermisosVisualizacionComponent
     */
    obtenerPerfilesActivos(org: IOrganizacion) {
        this.perfilesOrganizacion = [];
        this.perfilUsuarioService.get({ idOrganizacion: org ? org.id : null }).subscribe((res: IPerfilUsuario[]) => {
            res.forEach((perfil: IPerfilUsuario) => {
                if (perfil.activo) {
                    this.perfilesOrganizacion.push({ perfil: perfil, checked: this.tienePerfilAsignado(perfil), permisos: this.imprimirPermisos(perfil.permisos) });
                }
            });
        });
    }

    /**
     * Indica si el usuario tiene asignado cada uno de los permisos que incluye el perfil
     * @param {IPerfilUsuario} perfil
     * @returns {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    tienePerfilAsignado(perfil: IPerfilUsuario): boolean {
        return !perfil.permisos.some((permiso: string) => { // some trae todos los permisos del perfil que no tiene el usuario. Debe ser vacío, por eso está negado
            return !this.usuarioTienePermiso(permiso); // bandera devuelve si no tiene el permiso
        });
    }

    /**
     * Devuelve si el permiso del perfil es de menor categoría que el perfil asignado del usuario
     * Ejemplos:
     * esPermisoUsuarioMayorCategoriaPermisoPerfil('turnos:puedeEditar', 'turnos:*')                ->  True
     * esPermisoUsuarioMayorCategoriaPermisoPerfil('mpi:paciente:dashboard', 'mpi:*')               ->  True
     * esPermisoUsuarioMayorCategoriaPermisoPerfil('turnos:*', 'turnos:puedeSuspender')             ->  False
     * esPermisoUsuarioMayorCategoriaPermisoPerfil('mpi:paciente:deleteAndes', 'internacion:censo') ->  False
     *
     * @private
     * @param {string[]} arrayPermisoPerfil corresponde a un solo permiso donde cada celda es una key del permiso
     * @param {string[]} arrayPermisoUsuario corresponde a un solo permiso donde cada celda es una key del permiso
     * @returns {boolean}
     * @see esPermisoUsuarioMenorCategoriaPermisoPerfil(string[],string[]): boolean
     * @memberof PermisosVisualizacionComponent
     */
    // private esPermisoUsuarioMayorCategoriaPermisoPerfil(arrayPermisoPerfil: string[], arrayPermisoUsuario: string[]): boolean {
    //     if (arrayPermisoPerfil.length < arrayPermisoUsuario.length) {
    //         return false;
    //     }
    //     let i = 0;
    //     let bandera = true;
    //     while (i < arrayPermisoUsuario.length && bandera) {
    //         if (arrayPermisoPerfil[i] !== arrayPermisoUsuario[i] && arrayPermisoUsuario[i] !== '*') {
    //             bandera = false;
    //         }
    //         i++;
    //     }
    //     return bandera;
    // }


    /**
     * Indica si el permiso del perfil es de menor categoría que el del que ya tiene asignado el usuario.
     * Menor categoría se refiere a que tiene menos privilegios.
     *
     * esPermisoUsuarioMenorCategoriaPermisoPerfil('mpi:paciente:dashboard', 'mpi:*')               ->  { false, false }
     * esPermisoUsuarioMenorCategoriaPermisoPerfil('turnos:*', 'turnos:puedeSuspender')             ->  { true, true }
     * esPermisoUsuarioMenorCategoriaPermisoPerfil('turnos:puedeCrear', 'turnos:puedeSuspender')    ->  { true, false }
     * esPermisoUsuarioMenorCategoriaPermisoPerfil('mpi:paciente:deleteAndes', 'internacion:censo') ->  { true, false }
     * esPermisoUsuarioMenorCategoriaPermisoPerfil('turnos:puedeEditar', 'turnos:puedeEditar')      ->  { true, false }
     * si no se deseara agregar un permiso que el usuario ya tiene, como en el caso del ejemplo anterior, antes de llamar a esta función debería
     * verificarse que el permiso del perfil sea distinto del permiso del usuario (antes de aplicarles el .split(':'))
     * @private
     * @param {string[]} arrayPermisoPerfil
     * @param {string[]} arrayPermisoUsuario
     * @returns {boolean}
     * @see esPermisoUsuarioMayorCategoriaPermisoPerfil
     * @memberof PermisosVisualizacionComponent
     */
    // private esPermisoUsuarioMenorCategoriaPermisoPerfil(arrayPermisoPerfil: string[], arrayPermisoUsuario: string[]): { agregarPermisoPerfil: boolean, borrarPermisoUsuario: boolean } {
    //     let agregarPermisoPerfil = true; // se agrega el permiso cuando el permiso del perfil es de mayor categoría que el del usuario
    //     let borrarPermisoUsuario = false;
    //     let i = 0;
    //     if (arrayPermisoPerfil.length === arrayPermisoUsuario.length && (i + 1) === arrayPermisoPerfil.length) {

    //     }
    //     while (i < arrayPermisoPerfil.length && i < arrayPermisoUsuario.length && agregarPermisoPerfil && !borrarPermisoUsuario) { // siempre y cuando no haya modificado alguna de las banderas
    //         if (arrayPermisoPerfil[i] !== arrayPermisoUsuario[i]) {
    //             if (arrayPermisoUsuario[i] === '*') {
    //                 agregarPermisoPerfil = false;
    //             } else if (arrayPermisoPerfil[i] === '*') {
    //                 borrarPermisoUsuario = true;
    //             }
    //         }
    //         i++;
    //     }
    //     return { agregarPermisoPerfil: agregarPermisoPerfil, borrarPermisoUsuario: borrarPermisoUsuario };
    // }
    obtenerPermisosUsuario(usuario, organizacion: IOrganizacion) {
        if (usuario && organizacion) {
            this.usuarioService.getByDniOrg({ dni: usuario.nombre, idOrganizacion: organizacion.id }).subscribe(res => {
                this.permisosUsuarioOrg = res;
            });
        }
    }
    /**
     * Modifica los perfiles del usuario seleccionado (en memoria) y notifica al componente que contiene a este
     * @param {boolean} event
     * @param {number} indice
     * @memberof PermisosVisualizacionComponent
     */
    tildarPerfil(event: any, indice: number) {
        let permisosPerfilTildado = this.perfilesOrganizacion[indice].perfil.permisos;
        this.permisosUsuarioOrg = event.value ? agregarPermiso(this.permisosUsuarioOrg, permisosPerfilTildado) : quitarPermiso(this.permisosUsuarioOrg, permisosPerfilTildado, this.arbolPermisosCompleto);
        this.seleccionCheckboxPerfil.emit({ checked: this.perfilesOrganizacion[indice].checked, permisos: this.permisosUsuarioOrg });
    }

    /**
     * Tilda los perfiles cuando el usuario tiene todos sus permisos
     * @private
     * @memberof PermisosVisualizacionComponent
     */
    private tildarPerfilesCorrespondientes() {
        this.perfilesOrganizacion.forEach((perfil: { perfil: IPerfilUsuario, checked: boolean }) => {
            perfil.checked = this.tienePerfilAsignado(perfil.perfil);
        });
    }

    /**
     * Indica si el usuario tiene o no el permiso pasado por parámetro
     * @private
     * @param {string} permiso
     * @returns {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    private usuarioTienePermiso(permiso: string): boolean {
        return this.permisosUsuarioOrg.some((permisoUsuario: string) => {
            let bandera = permiso === permisoUsuario || esPermisoSubpermiso(permiso, permisoUsuario);
            return bandera;
        });
    }

    private imprimirPermisos(permisos: string[]): string {
        return obtenerPermisosParaMostrar(permisos, this.arbolPermisosCompleto, this.servicioTipoPrestacion);
    }
}
