import { IPermiso } from '../interfaces/IPermiso';

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
            if (!tieneRelacionAscendente(permisoPerfil, permisoUsuario)) {
                return true;
            } else if (permisoPerfil.length < permisoUsuario.length) { // si el permiso del perfil es ascendente del permiso del usuario
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

/**
 * Convierte los string de los permisos del usuario con el valor que se muestra en pantalla
 * Le da un formato legible para mostrar debajo de cada perfil y en mensaje de confirmación edición permisos
 * @export
 * @param {string[]} permisosImprimir
 * @param {IPermiso[]} arbolPermisos
 * @returns {string}
 */
export function obtenerPermisosParaMostrar(permisosImprimir: string[], arbolPermisos: IPermiso[]): string {
    /*
    * permisosUsuario: ['mpi:paciente:crear', 'mpi:paciente:editar', turnos:agenda:*', 'laboratorio:*']
    * debe devolver (correspondientes title en lugar de key)
    * mpi
    *   paciente
    *       crear
    *       editar
    * turnos
    *   agenda (todos)
    * laboratorio (todos)
    */

    let res = '';
    /*
    * Pseudocodigo
        por cada permisoImprimir
            obt
    *
    */



    return obtenerArreglosMismoNivel(permisosImprimir, 0, '', [], arbolPermisos);








    // debugger;
    // permisosImprimir.forEach((permisoImprimir: string) => {
    //     // permisoUsuario = 'mpi:paciente:crear'
    //     let permUser = permisoImprimir.split(':');
    //     // permiso = 'mpi'  |  'paciente'  |  'crear'


    //     let permiso: IPermiso;
    //     let primero = true;
    //     permUser.forEach((key: string) => {
    //         if (key === '*') {
    //             res += ' (todos)';
    //         } else {



    //             // if (primero) {
    //             //     primero = false;
    //             //     permiso = arbolPermisos.find((perm: IPermiso) => {
    //             //         return perm.key === key;
    //             //     });
    //             //     if (permiso) {
    //             //         res = permiso.title;
    //             //     } else {
    //             //         console.log('Permiso es undefined A: ', res, permiso);
    //             //     }
    //             // } else {
    //             //     if (permiso && permiso.child) {
    //             //         permiso = permiso.child.find((perm: IPermiso) => {
    //             //             return perm.key === key;
    //             //         });
    //             //         if (permiso) {
    //             //             res += '\n\t' + permiso.title;
    //             //         } else {
    //             //             console.log('Permiso es undefined B: ', res, permiso);
    //             //         }
    //             //     } else {
    //             //         console.log('EsTE es el que haria explotar todo: ', res, permiso);
    //             //     }
    //             // }


    //             // el permiso.child tira error porque no siempre tiene child -> no se puede hacer
    //             // me parece que hay key que no encuentra entonces permiso queda indefinido -> explota
    //             permiso = (primero ? arbolPermisos : permiso.child).find((perm: IPermiso) => {
    //                 return perm.key === key;
    //             });
    //             if (primero) {
    //                 if (res !== '') {
    //                     res += '<br>';
    //                 }
    //                 res += permiso.title;
    //             } else {
    //                 res += '<br>&nbsp;&nbsp;&nbsp;&nbsp;' + permiso.title;
    //             }

    //             // res += primero ? permiso.title : '\n\t' + permiso.title;
    //             primero = false;
    //         }

    //     });

    // });
    return res;
}

function
    obtenerArreglosMismoNivel(arregloImprimir: string[], nivel: number, res: string, keysYaImpresas: string[], arbolPermisos: IPermiso[]): string { // mpi:paciente:crear  0
    arregloImprimir.forEach((permiso: string) => {
        let primero = res === '';
        let permArray = permiso.split(':'); // turnos   agenda   *
        let filtro = '';

        for (let i = 0; i <= nivel; i++) {
            filtro += permArray[i];
            if (i < nivel) {
                filtro += ':';
            }
        }

        let permisosFiltrados = arregloImprimir.filter((perm: string) => {
            return filtro === perm.substr(0, filtro.length);
        });

        // imprimir filtro
        if (keysYaImpresas && !keysYaImpresas.find((key: string) => { return key === filtro; })) {
            keysYaImpresas.push(filtro);
            let agregar = filtro.split(':');

            if (primero) {
                res += '- ' + obtenerTituloPermiso(filtro, nivel, arbolPermisos);
            } else {
                if (agregar[nivel] === '*') {
                    res += ' (todos)';
                } else {
                    res += '<br>';
                    for (let i = 0; i < nivel; i++) {
                        res += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    }
                    res += '- ' + obtenerTituloPermiso(filtro, nivel, arbolPermisos);
                }
            }
        }

        if (nivel < permArray.length - 1) {
            res = obtenerArreglosMismoNivel(permisosFiltrados, nivel + 1, res, keysYaImpresas, arbolPermisos);
            return res;
        }
    });
    return res;
}

function obtenerTituloPermiso(permisoString: string, nivel: number, arbolPermisos: IPermiso[]): string {
    // permisoString = a:b:c:d    nivel: 2  -> debe traer el titulo de c
    let res = '';
    let keys = permisoString.split(':');
    let permiso: IPermiso;
    // let primero = true;
    let i = 0;

    while (i <= nivel && i < keys.length) {
        permiso = (i === 0 ? arbolPermisos : permiso.child).find((perm: IPermiso) => {
            return perm.key === keys[i];
        });
        i++;
    }
    return permiso.title;
}
