import { IPermiso } from '../interfaces/IPermiso';


// let usuarioService: UsuarioService;

// export let arbolPermisosCompleto: IPermiso[]; // = this.usuarioService.permisos().subscribe();
// let permisosUsuarioOrg: string[];

// export function getPermisosUsuarioOrg(): string[] {
//     return permisosUsuarioOrg;
// }
// export function setPermisosUsuarioOrg(permisos: string[]) {
//     console.log('Entro al set controlador: ', permisos);
//     permisosUsuarioOrg = permisos;
//     console.log('Entro al set controlador: ', permisosUsuarioOrg);
// }
/**
 * A los permisos del usuario pasado por parámetro, se le agregan los permisosAgregar de forma correcta
 * @export
 * @param {string[]} permisosUsuario
 * @param {string[]} permisosAgregar
 * @returns {string[]} permisoUsuario con los permisos agregados
 */
export function agregarPermiso(permisosUsuario: string[], permisosAgregar: string[]): string[] {
    let arregloPermisosAgregar: string[] = [];
    let arregloPermisosBorrar: string[] = [];

    if (!permisosUsuario.length) {
        // si está vacío, agrego todos los permisos del perfil, sin verificarlos
        arregloPermisosAgregar = permisosAgregar;
    } else {
        permisosAgregar.forEach((permisoPerfil: string) => {
            let perfilPermisoYaAgregado = false;
            // al arreglopermisosBorrar le voy agregrando los permisos del usuario que son de menor categoría que los que ya tiene el usuario
            arregloPermisosBorrar = arregloPermisosBorrar.concat(permisosUsuario.filter((permisoUsuario: string) => {
                if (permisoPerfil !== permisoUsuario) { // si es el mismo permiso, no hago nada
                    let res = seDebeAgregarPermiso(permisoPerfil.split(':'), permisoUsuario.split(':'));

                    if (res.agregarPermisoPerfil && !perfilPermisoYaAgregado) {
                        arregloPermisosAgregar.push(permisoPerfil);
                        perfilPermisoYaAgregado = true; // para evitar agregar varias veces el mismo permiso del perfil al usuario
                    }
                    return res.borrarPermisoUsuario;
                    // } else {
                    //     return true;
                }
            }));
        });
    }

    // procedo a borrar del usuario todos los permisos que se encuentran en el arreglo de borrar
    arregloPermisosBorrar.forEach((permisoBorrrar: string) => {
        permisosUsuario.splice(permisosUsuario.indexOf(permisoBorrrar), 1);
    });

    return permisosUsuario.concat(arregloPermisosAgregar);
}

export function quitarPermiso(permisosUsuario: string[], permisosQuitar: string[], arbolPermisos: IPermiso[]): string[] {
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

    let arregloPermisosAgregar: string[] = [];
    let arregloPermisosBorrar: string[] = [];

    permisosQuitar.forEach((permisoPerfil: string) => {
        permisosUsuario = permisosUsuario.filter((permisoUsuario: string) => {
            // reportes - reportes se filtra con permisoPerfil !== permisoUsuario
            if (permisoPerfil === permisoUsuario) {
                return false;
            }
            if (tieneRelacionAscendente(permisoPerfil, permisoUsuario)) {
                if (permisoPerfil.length < permisoUsuario.length) { // si el permiso del perfil es ascendente del permiso del usuario
                    let longitudPermiso = permisoPerfil.indexOf('*') === -1 ? permisoPerfil.length : permisoPerfil.length - 2;
                    return permisoUsuario.substr(0, longitudPermiso) !== permisoPerfil.substr(0, longitudPermiso);
                } else { // si el permiso del perfil es descendente del permiso del usuario
                    // buscar todos los hermanos del permiso del perfil. Borrar todos
                    // perfil= mpi:paciente:*   usuario = mpi:*
                    let longitudPermiso = permisoPerfil.indexOf('*') === -1 ? permisoPerfil.length : permisoPerfil.length - 2;
                    let filtroPermiso = permisoPerfil.substr(0, longitudPermiso);


                    // estos son los permisos que debo agregar al usuario
                    let subpermisos = buscarSubpermisos(permisoUsuario, arbolPermisos);
                    arregloPermisosAgregar = arregloPermisosAgregar.concat(subpermisos.filter((subpermiso: string) => {
                        return subpermiso.substr(0, filtroPermiso.length) !== filtroPermiso;
                    }));
                }

            } else {
                return true; // no tienen nada que ver los permisos   mpi:*   turnos:*
            }
        });
    });

    return permisosUsuario.concat(arregloPermisosAgregar);
}


/**
 * Indica si el permiso del perfil es de menor categoría que el del que ya tiene asignado el usuario.
 * Menor categoría se refiere a que tiene menos privilegios.
 *
 * seDebeAgregarPermiso('mpi:paciente:dashboard', 'mpi:*')               ->  { false, false }
 * seDebeAgregarPermiso('turnos:*', 'turnos:puedeSuspender')             ->  { true, true }
 * seDebeAgregarPermiso('turnos:puedeCrear', 'turnos:puedeSuspender')    ->  { true, false }
 * seDebeAgregarPermiso('mpi:paciente:deleteAndes', 'internacion:censo') ->  { true, false }
 * seDebeAgregarPermiso('turnos:puedeEditar', 'turnos:puedeEditar')      ->  { true, false }
 * si no se deseara agregar un permiso que el usuario ya tiene, como en el caso del ejemplo anterior, antes de llamar a esta función debería
 * verificarse que el permiso del perfil sea distinto del permiso del usuario (antes de aplicarles el .split(':'))
 *
 * @param {string[]} arrayPermisoPerfil
 * @param {string[]} arrayPermisoUsuario
 * @returns {{ agregarPermisoPerfil: boolean, borrarPermisoUsuario: boolean }}
 */
function seDebeAgregarPermiso(arrayPermisoPerfil: string[], arrayPermisoUsuario: string[]): { agregarPermisoPerfil: boolean, borrarPermisoUsuario: boolean } {
    let agregarPermisoPerfil = true; // se agrega el permiso cuando el permiso del perfil es de mayor categoría que el del usuario
    let borrarPermisoUsuario = false;
    let i = 0;
    // if (arrayPermisoPerfil.length === arrayPermisoUsuario.length && (i + 1) === arrayPermisoPerfil.length) {

    // }
    while (i < arrayPermisoPerfil.length && i < arrayPermisoUsuario.length && agregarPermisoPerfil && !borrarPermisoUsuario) { // siempre y cuando no haya modificado alguna de las banderas
        if (arrayPermisoPerfil[i] !== arrayPermisoUsuario[i]) {
            if (arrayPermisoUsuario[i] === '*') {
                agregarPermisoPerfil = false;
            } else if (arrayPermisoPerfil[i] === '*') {
                borrarPermisoUsuario = true;
            }
        }
        i++;
    }
    return { agregarPermisoPerfil: agregarPermisoPerfil, borrarPermisoUsuario: borrarPermisoUsuario };
}


/**
 * Indica si ambos permisos están relacionados de forma ascendente o no
 * Ejemplo:
 * tieneRelacionAscendente(mpi:*, mpi:nuevoPaciente)            = true
 * tieneRelacionAscendente(mpi:*, citas)                        = false
 * tieneRelacionAscendente(mpi:matching:get, mpi:matching:put)  = false
 *
 * @param {string} permisoPerfil
 * @param {string} permisoUsuario
 * @returns {boolean}
 */
function tieneRelacionAscendente(permisoPerfil: string, permisoUsuario: string): boolean {
    let permPerf = permisoPerfil.split(':');
    let permUser = permisoUsuario.split(':');
    let esAscendente = true;
    let i = 0;
    while (i < permPerf.length && i < permUser.length && esAscendente) {
        if (permPerf[i] !== permUser[i] && permPerf[i] !== '*' && permUser[i] !== '*') {
            esAscendente = false;
        }
        i++;
    }
    return esAscendente;
}

/**
 * Devuelve un arreglo de los subpermisos al permiso pasado por parámetro
 * @param {string} permisoUsuario
 * @param {IPermiso[]} arbolPermisos
 * @returns {string[]}
 */
function buscarSubpermisos(permisoUsuario: string, arbolPermisos: IPermiso[]): string[] {

    permisoUsuario = permisoUsuario.substr(0, permisoUsuario.length - 2); // le quito los ultimos dos caracteres = ':*'
    let permUser = permisoUsuario.includes(':') ? permisoUsuario.split(':') : [permisoUsuario];
    // let permUser = permisoUsuario.split(':');
    // permUser.splice(permUser.length - 1, 1); // elimino el el ultimo elemento porque es el *
    let permiso: IPermiso;
    let primero = true;
    // con esto obtengo el permiso del cual tiene el *
    permUser.forEach((key: string) => {
        permiso = (primero ? arbolPermisos : permiso.child).find((perm: IPermiso) => {
            return perm.key === key;
        });
        primero = false;
    });

    let subpermisos: string[] = [];
    let asterisco: string;
    permiso.child.forEach((subpermiso: IPermiso) => {
        asterisco = '';
        if (subpermiso.child) {
            asterisco = ':*';
        }
        subpermisos.push(permisoUsuario + ':' + subpermiso.key + asterisco);
    });
    return subpermisos;
}

/**
 * Devuelve true cuando el segundo parámetro es subpermiso del primer parámetro
 * @param {string} permiso
 * @param {string} subpermiso
 * @returns {boolean}
 */
export function esPermisoSubpermiso(permiso: string, subpermiso: string): boolean {
    return tieneRelacionAscendente(permiso, subpermiso) && permiso.length < subpermiso.length;
}
