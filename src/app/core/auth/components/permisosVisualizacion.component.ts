import { ArbolPermisosComponent } from './../../../components/usuario/arbolPermisos.component';
import { IPermiso } from './../interfaces/IPermiso';
import { UsuarioService } from './../../../services/usuarios/usuario.service';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';
import { agregarPermiso, quitarPermiso, esPermisoSubpermiso } from '../controllers/permisos';

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
    public perfilesOrganizacion: { perfil: IPerfilUsuario, checked: boolean }[] = [];

    public usuario = null;
    public organizacion: IOrganizacion = null;

    constructor(private perfilUsuarioService: PerfilUsuarioService, private usuarioService: UsuarioService) { }
    async cargar() {
        if (this.usuario) {
            // try {
            //     await this.obtenerPermisosUsuario(this.usuario, this.organizacion);
            //     // this.permisosUsuarioOrg = getPermisosUsuarioOrg();
            // } catch (err) {
            //     return err;
            // }
            this.obtenerPerfiles(this.organizacion);
        }
    }
    /**
     * Recupera de la base de datos todos los perfiles asociados a la organización
     * @param {IOrganizacion} org
     * @memberof PermisosVisualizacionComponent
     */
    obtenerPerfiles(org: IOrganizacion) {
        this.perfilesOrganizacion = [];
        this.perfilUsuarioService.get({ idOrganizacion: org ? org.id : null }).subscribe((res: IPerfilUsuario[]) => {
            res.forEach(async (perfil: IPerfilUsuario) => {
                this.perfilesOrganizacion.push({ perfil: perfil, checked: await this.tienePerfilAsignado(perfil) });
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

        if (this.permisosUsuarioOrg && this.permisosUsuarioOrg.length) {
            let i = 0;
            let cumpleTodosLosPermisos = true;
            while (i < perfil.permisos.length && cumpleTodosLosPermisos) {
                let permisoPerfilDividido = perfil.permisos[i].split(':');
                let permisoEncontrado = this.permisosUsuarioOrg.find((permisoUsuario: string) => {
                    return permisoUsuario === perfil.permisos[i] || this.esPermisoUsuarioMayorCategoriaPermisoPerfil(permisoPerfilDividido, permisoUsuario.split(':'));
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
    private esPermisoUsuarioMayorCategoriaPermisoPerfil(arrayPermisoPerfil: string[], arrayPermisoUsuario: string[]): boolean {
        if (arrayPermisoPerfil.length < arrayPermisoUsuario.length) {
            return false;
        }
        let i = 0;
        let bandera = true;
        while (i < arrayPermisoUsuario.length && bandera) {
            if (arrayPermisoPerfil[i] !== arrayPermisoUsuario[i] && arrayPermisoUsuario[i] !== '*') {
                bandera = false;
            }
            i++;
        }
        return bandera;
    }


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
        // let arregloPermisosAgregar: string[] = [];
        // let arregloPermisosBorrar: string[] = [];
        if (event.value) {
            this.permisosUsuarioOrg = agregarPermiso(this.permisosUsuarioOrg, permisosPerfilTildado);

            // *********************************  Esto estaba funcionando bien  *****************************************************
            // // agregar permiso
            // if (!this.permisosUsuarioOrg.length) {
            //     // si está vacío, agrego todos los permisos del perfil, sin verificarlos
            //     arregloPermisosAgregar = permisosPerfilTildado;
            // } else {
            //     permisosPerfilTildado.forEach((permisoPerfil: string) => {
            //         let perfilPermisoYaAgregado = false;
            //         // al arreglopermisosBorrar le voy agregrando los permisos del usuario que son de menor categoría que los que ya tiene el usuario

            //         arregloPermisosBorrar = arregloPermisosBorrar.concat(this.permisosUsuarioOrg.filter((permisoUsuario: string) => {
            //             if (permisoPerfil !== permisoUsuario) { // si es el mismo permiso, no hago nada
            //                 let res = this.esPermisoUsuarioMenorCategoriaPermisoPerfil(permisoPerfil.split(':'), permisoUsuario.split(':'));

            //                 if (res.agregarPermisoPerfil && !perfilPermisoYaAgregado) {
            //                     arregloPermisosAgregar.push(permisoPerfil);
            //                     perfilPermisoYaAgregado = true; // para evitar agregar varias veces el mismo permiso del perfil al usuario
            //                 }
            //                 return res.borrarPermisoUsuario;
            //             }
            //         }));
            //     });
            // }

            // // procedo a borrar del usuario todos los permisos que se encuentran en el arreglo de borrar
            // arregloPermisosBorrar.forEach((permisoBorrrar: string) => {
            //     this.permisosUsuarioOrg.splice(this.permisosUsuarioOrg.indexOf(permisoBorrrar), 1);
            // });

            // this.permisosUsuarioOrg = this.permisosUsuarioOrg.concat(arregloPermisosAgregar);
            // **************************************************************************************

        } else { // destilda el perfil, quito todos los permisos del perfil
            this.permisosUsuarioOrg = quitarPermiso(this.permisosUsuarioOrg, permisosPerfilTildado, this.arbolPermisosCompleto);


            // Ejemplo de borrar

            // permisos perfil         permisos usuario
            // reportes                reportes
            // matriculaciones:*       matriculaciones:profesionales:getProfesional
            //                         matriculaciones:turnos:*

            // tm:especialidad:*       tm:especialidad:postEspecialidad
            //                         tm:organizacion:create
            //                         tm:organizacion:edit

            // cda:get                 cda:*


            // El usuario debería quedar así:
            //                         tm:organizacion:create
            //                         tm:organizacion:edit
            //                         cda:list
            //                         cda:post
            //                         cda:organizacion
            //                         cda:paciente

            // Emtonces por cada permiso del perfil quitado hay 4 opciones:
            // - Los permisos son iguales  (reportes - reportes)
            // - Perfil Mayor categoría usuario (matriculaciones:* - matriculaciones:profesionales)
            // - Perfil Menor categoría usuario (cda:get - cda:*)
            // - Perfil Igual categoría usuario (tm:especialidad - tm:organizacion)


            // permisosPerfilTildado.forEach((permisoPerfil: string) => {
            //     this.permisosUsuarioOrg = this.permisosUsuarioOrg.filter((permisoUsuario: string) => {
            //         // reportes - reportes se filtra con permisoPerfil !== permisoUsuario
            //         if (permisoPerfil === permisoUsuario) {
            //             return false;
            //         }
            //         if (this.tieneRelacionAscendente(permisoPerfil, permisoUsuario)) {
            //             if (permisoPerfil.length < permisoUsuario.length) { // si el permiso del perfil es ascendente del permiso del usuario
            //                 let longitudPermiso = permisoPerfil.indexOf('*') === -1 ? permisoPerfil.length : permisoPerfil.length - 2;
            //                 return permisoUsuario.substr(0, longitudPermiso) !== permisoPerfil;
            //             } else { // si el permiso del perfil es descendente del permiso del usuario
            //                 // buscar todos los hermanos del permiso del perfil. Borrar todos
            //                 // perfil= mpi:paciente:*   usuario = mpi:*
            //                 let longitudPermiso = permisoPerfil.indexOf('*') === -1 ? permisoPerfil.length : permisoPerfil.length - 2;
            //                 let filtroPermiso = permisoPerfil.substr(0, longitudPermiso);


            //                 // estos son los permisos que debo agregar al usuario
            //                 let subpermisos = this.buscarSubpermisos(permisoUsuario);
            //                 arregloPermisosAgregar = arregloPermisosAgregar.concat(subpermisos.filter((subpermiso: string) => {
            //                     return subpermiso.substr(0, filtroPermiso.length) !== filtroPermiso;
            //                 }));
            //             }

            //         } else {
            //             return true; // no tienen nada que ver los permisos   mpi:*   turnos:*
            //         }
            //     });
            // });

            // this.permisosUsuarioOrg = this.permisosUsuarioOrg.concat(arregloPermisosAgregar);
        }
        // mirar si se puede reutilizar el código entre los dos caminos del if. Posiblemente el borrado de los permisos pueda hacerse al ultimo, una sola vez el codigo
        this.seleccionCheckboxPerfil.emit({ checked: this.perfilesOrganizacion[indice].checked, permisos: this.permisosUsuarioOrg });
    }

    /**
     * Indica si ambos permisos están relacionados de forma ascendente o no
     * Ejemplo:
     * tieneRelacionAscendente(mpi:*, mpi:nuevoPaciente)            = true
     * tieneRelacionAscendente(mpi:*, citas)                        = false
     * tieneRelacionAscendente(mpi:matching:get, mpi:matching:put)  = false
     * @param {string} permisoPerfil
     * @param {string} permisoUsuario
     * @returns {boolean}
     * @memberof PermisosVisualizacionComponent
     */
    // tieneRelacionAscendente(permisoPerfil: string, permisoUsuario: string): boolean {
    //     let permPerf = permisoPerfil.split(':');
    //     let permUser = permisoUsuario.split(':');
    //     let esAscendente = true;
    //     let i = 0;
    //     while (i < permPerf.length && i < permUser.length && esAscendente) {
    //         if (permPerf[i] !== permUser[i] && permPerf[i] !== '*' && permUser[i] !== '*') {
    //             esAscendente = false;
    //         }
    //         i++;
    //     }
    //     return esAscendente;
    // }

    /**
     * Compara el nivel del permiso del usuario con el del perfil
     * @param {string} permisoPerfil
     * @param {string} permisoUsuario
     * @returns {string}
     * @memberof PermisosVisualizacionComponent
     */
    // nivelArbolPermisoUsuarioPerfil(permisoPerfil: [string], permisoUsuario: [string]): string {
    //     let res: string;
    //     let i = 0;
    //     while (i < permisoPerfil.length && i < permisoUsuario.length) {
    //         if (permisoPerfil[i] !== permisoUsuario[i]) { // si es igual, avanzo para ver hasta donde son diferentes
    //             if (permisoPerfil[i] === '*') {
    //                 // permisoUsuario a:b:c:d       permisoPerfil a:*       borrar todos los permisos del usuario que empiecen con a:BORRAR
    //                 // permisoPerfil es padre del permiso usuario, borrar a partir permisoPerfil[i-1]
    //             } else if (permisoUsuario[i] === '*') {
    //                 // permisoUsuario a:*         permisoPerfil a:b:c:d:*
    //                 // Obtener todos los hijos de a
    //                 // Eliminar todos los permisos que comiencen con a:b:c:d (si permisoPerfil es hoja, es uno solo, break)
    //                 // permisoUsuario es padre del permiso perfil. Buscar todos los hermanos del permisoPerfil[i]
    //             } else {
    //                 // permisoUsuario a:b       permisoPerfil a:x
    //                 // no hacer nada
    //             }
    //         }

    //         i++;
    //     }
    //     return res;
    // }

    /**
     * Tilda los perfiles cuando el usuario tiene todos sus permisos
     * @private
     * @returns {*}
     * @memberof PermisosVisualizacionComponent
     */
    private tildarPerfilesCorrespondientes(): any {
        this.perfilesOrganizacion.forEach((perfil: { perfil: IPerfilUsuario, checked: boolean }) => {
            perfil.checked = !perfil.perfil.permisos.some((permiso: string) => {
                let bandera = !this.usuarioTienePermiso(permiso);
                return bandera;
            });
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
}
