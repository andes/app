import { IPermiso } from '../interfaces/IPermiso';
/*
* Indica las posibles relaciones entre dos permisos
*/
let relaciones = {
    mismo: 'mismo', // a:b    mismo que a:b
    padre: 'padre', // a:*    padre de a:b:c* , a:x:r
    hijo: 'hijo',   // a:b:c* hijo de a:b:* y a:*
    otro: 'otro'    // a:b    otro de t:r ,  a:d
};

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
 * Indica si el permiso del perfil (primero) es de menor categoría que el del que ya tiene asignado el usuario (segundo).
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
// function seDebeAgregarPermiso(arrayPermisoPerfil: string[], arrayPermisoUsuario: string[]): { agregarPermisoPerfil: boolean, borrarPermisoUsuario: boolean } {
//     let agregarPermisoPerfil = true; // se agrega el permiso cuando el permiso del perfil es de mayor categoría que el del usuario
//     let borrarPermisoUsuario = false;
//     let i = 0;
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
    let relacion = obtenerRelacion(permisoPerfil, permisoUsuario);
    return relacion === relaciones.hijo || relacion === relaciones.padre;
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
    return tieneRelacionAscendente(permiso, subpermiso) && permiso.length > subpermiso.length;
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
    return obtenerArreglosMismoNivel(permisosImprimir, 0, '', [], arbolPermisos);
}

/**
 * Función recursiva que, a partir de un arreglo de permisos, obtiene diferentes arreglos de strings, todos comenzando con la misma clave
 * Ejemplo:
 * arregloImprimir = ['a:b:c', 'a:b:d', 'a:x']
 * primera pasada obtiene: ['a:b:c', 'a:b:d', 'a:x']e imprime
 *              Título A
 * segunda pasada obtiene: ['a:b:c', 'a:b:d'] e imprime
 *              <TAB>Título B
 * tercera pasada obtiene: ['a:b:c'] ['a:b:d'] e imprime
 *              <TAB><TAB>Título C
 *              <TAB><TAB>Título D
 * retorna a la segunda pasada la impresión, que vuelve a la primera y agrega
 *              <TAB>Título X
 * @param {string[]} arregloImprimir
 * @param {number} nivel
 * @param {string} res
 * @param {string[]} keysYaImpresas
 * @param {IPermiso[]} arbolPermisos
 * @returns {string}
 */
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










export function agregarPermiso(permisosUsuario: string[], permisosAgregar: string[]): string[] { // hay otra version de esta
    // debugger;
    let arregloRes: string[] = [];
    if (!permisosUsuario.length) {
        // si está vacío, agrego todos los permisos del perfil, sin verificarlos
        arregloRes = permisosAgregar;
    } else {
        permisosUsuario = borrarHijos(permisosUsuario, permisosAgregar);
        permisosAgregar = borrarHijos(permisosAgregar, permisosUsuario);

        permisosAgregar.forEach((permisoAgregar: string) => {
            permisosUsuario.forEach((permisoUsuario: string) => {
                let relacion = obtenerRelacion(permisoUsuario, permisoAgregar);
                switch (relacion) {
                    case relaciones.mismo: // agrego uno de los dos
                        if (arregloRes.indexOf(permisoAgregar) === -1) {
                            arregloRes.push(permisoAgregar);
                        }
                        break;
                    case relaciones.otro: // agrego los dos siempre y cuando no sean hijo de otro
                        if (arregloRes.indexOf(permisoAgregar) === -1) {
                            arregloRes.push(permisoAgregar);
                        }
                        if (arregloRes.indexOf(permisoUsuario) === -1) {
                            arregloRes.push(permisoUsuario);
                        }
                }
            });
        });
    }
    return arregloRes;
}



/**
 * Devuelve la relación del primer permiso con respecto del segundo
 * @param {string} permisoUsuario
 * @param {string} permisoPerfil
 * @returns {string}
 */
function obtenerRelacion(permisoUsuario: string, permisoPerfil: string): string {
    let i = 0;
    if (permisoUsuario === permisoPerfil) {
        return relaciones.mismo;
    } else {
        let arrayPermisoUsuario = permisoUsuario.split(':');
        let arrayPermisoPerfil = permisoPerfil.split(':');
        while (i < arrayPermisoPerfil.length && i < arrayPermisoUsuario.length) {
            if (arrayPermisoPerfil[i] === arrayPermisoUsuario[i]) {
                i++;
            } else if (arrayPermisoUsuario[i] === '*') {
                return relaciones.padre;
            } else if (arrayPermisoPerfil[i] === '*') {
                return relaciones.hijo;
            } else {
                return relaciones.otro; // o lejano -> a:b:c hermano de a:b:d y tambien de x:y:*
            }
        }
    }
}

/**
 * Indica si el permiso es hijo de alguno de los permisos del arreglo
 * @param {string} permiso
 * @param {string[]} posiblesPadres
 * @returns {boolean}
 */
function hijoDeAlguno(permiso: string, posiblesPadres: string[]): boolean {
    return posiblesPadres.some((posiblePadre: string) => {
        let relacion = obtenerRelacion(permiso, posiblePadre);
        return relacion === relaciones.hijo;
    });
}

/**
 * Borra todos los permisos del primer arreglo que sean hijo de alguno del segundo arreglo
 * @param {string[]} posiblesHijos
 * @param {string[]} posiblesPadres
 * @returns {string[]}
 */
function borrarHijos(posiblesHijos: string[], posiblesPadres: string[]): string[] {
    let permisosHijos = posiblesHijos.filter((posibleHijo: string) => {
        return hijoDeAlguno(posibleHijo, posiblesPadres);
    });
    permisosHijos.forEach((hijo: string) => {
        let i = posiblesHijos.indexOf(hijo);
        if (i !== -1) {
            posiblesHijos.splice(i, 1);
        }
    });
    return posiblesHijos;
}

















