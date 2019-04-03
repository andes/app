import { IPermiso } from '../interfaces/IPermiso';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { Observable } from 'rxjs/Observable';
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
    /** Ejemplo de borrar
    * permisos perfil         permisos usuario
    * reportes                reportes
    * matriculaciones:*       matriculaciones:profesionales:getProfesional
    *                         matriculaciones:turnos:*
    * tm:especialidad:*       tm:especialidad:postEspecialidad
    *                         tm:organizacion:create
    *                         tm:organizacion:edit
    * cda:get                 cda:*
    * El usuario debería quedar así:
    *                         tm:organizacion:create
    *                         tm:organizacion:edit
    *                         cda:list
    *                         cda:post
    *                         cda:organizacion
    *                         cda:paciente
    * Emtonces por cada permiso del perfil quitado hay 4 opciones:
    * - Los permisos son iguales  (reportes - reportes)
    * - Perfil Mayor categoría usuario (matriculaciones:* - matriculaciones:profesionales)
    * - Perfil Menor categoría usuario (cda:get - cda:*)
    * - Perfil Igual categoría usuario (tm:especialidad - tm:organizacion)
*/
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
                // TODO: confirmar si esto seria siempre verdadero
                let longitudPermiso = permisoPerfil.indexOf('*') === -1 ? permisoPerfil.length : permisoPerfil.length - 2; // perfil= a:b:*  usuario= a:b:e:x -> false
                return permisoUsuario.substr(0, longitudPermiso) !== permisoPerfil.substr(0, longitudPermiso); //  perfil= a:c  usuario= a:b:e:x -> true   Carece de sentido porque lo filtraría arriba por no ser ascendente
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
 * @param {string} permisoUsuario del tipo a:b:* (terminado en :*)
 * @param {IPermiso[]} arbolPermisos
 * @returns {string[]}
 */
function buscarSubpermisos(permisoUsuario: string, arbolPermisos: IPermiso[]): string[] {

    permisoUsuario = permisoUsuario.substr(0, permisoUsuario.length - 2); // le quito los ultimos dos caracteres = ':*'
    let permUser = permisoUsuario.split(':');
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
 * @param { TipoPrestacionService } servicioTipoPrestacion
 * @returns {string}
 */
export function obtenerPermisosParaMostrar(permisosImprimir: string[], arbolPermisos: IPermiso[], servicioTipoPrestacion: TipoPrestacionService) {
    // return obtenerPrestacionesDePermisos(permisosImprimir, arbolPermisos, servicioTipoPrestacion); // TODO: Borrar esto
}

/**
 * Obtiene en una sola llamada a la base de datos, todas las prestaciones de los permisos a imprimir, sin importar de qué permiso se trate
 * @param {*} permisosImprimir
 * @param {ITipoPrestacion[]} prestacionesTurneables
 * @returns {ITipoPrestacion[]}
 */
export function obtenerPrestacionesDePermisos(permisosImprimir, prestacionesTurneables): ITipoPrestacion[] {
    let idPrestaciones = [];
    let idPrestacion;
    let prestaciones: ITipoPrestacion[] = [];
    permisosImprimir.forEach((permiso: string) => {
        // Si se trata de unas de las opciones de permiso type = 'prestacion'
        if (permiso.substr(0, 'rup:tipoPrestacion'.length) === 'rup:tipoPrestacion'
            || permiso.substr(0, 'turnos:planificarAgenda:prestacion'.length) === 'turnos:planificarAgenda:prestacion'
            || permiso.substr(0, 'turnos:darTurnos:prestacion'.length) === 'turnos:darTurnos:prestacion'
            || permiso.substr(0, 'solicitudes:tipoPrestacion'.length) === 'solicitudes:tipoPrestacion') {
            let permisoDividido = permiso.split(':');
            idPrestacion = permisoDividido[permisoDividido.length - 1];
            if (idPrestacion !== '*' && idPrestaciones.indexOf(idPrestacion) === -1) {
                idPrestaciones.push(idPrestacion);
                prestaciones.push(prestacionesTurneables.find((prestacion: ITipoPrestacion) => {
                    return idPrestacion === prestacion.id;
                }));
            }
        }
    });
    return prestaciones;
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
 * @param {IPermiso[]} child
 * @param {ITipoPrestacion[]} prestaciones
 * @returns {string}
 */
export function
    obtenerArreglosMismoNivel(arregloImprimir: string[], nivel: number, res: string, keysYaImpresas: string[], arbolPermisos: IPermiso[], child: IPermiso, prestaciones: ITipoPrestacion[]): string { // mpi:paciente:crear  0
    arregloImprimir.forEach((permiso: string) => {
        let primero = res === '';
        let permArray = permiso.split(':'); // turnos   agenda   *
        let filtro = '';
        let permisoEncontrado: IPermiso;
        for (let i = 0; i <= nivel; i++) {
            filtro += permArray[i];
            if (i < nivel) {
                filtro += ':';
            }
        }


        // imprimir filtro
        if (keysYaImpresas && !keysYaImpresas.find((key: string) => { return key === filtro; })) {
            keysYaImpresas.push(filtro);
            let agregar = filtro.split(':');

            if (primero) {
                permisoEncontrado = obtenerTituloPermiso(filtro, nivel, arbolPermisos, child); // TODO: este seria en el caso de qeu el primer permiso sea de tipo booleano, ver como agregarglo a la logica de abajo
                res += '- ' + permisoEncontrado.title;
            } else {
                if (agregar[nivel] === '*') {
                    res += ' (todos)';
                } else {
                    res += '<br>';
                    for (let i = 0; i < nivel; i++) {
                        res += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    }
                    let tipo = child ? child.type : 'null';
                    switch (tipo) {
                        case 'boolean':
                            permisoEncontrado = obtenerTituloPermiso(filtro, nivel, arbolPermisos, child);
                            res += '- ' + permisoEncontrado.title;
                            break;
                        case 'prestacion':
                            res += !prestaciones ? 'NO PRESTACION' : '- ' + prestaciones.find((prestacion: ITipoPrestacion) => {
                                return prestacion.id === agregar[agregar.length - 1];
                            }).term;
                            break;
                        case 'organizacion':
                            res += '- ' + agregar[3];
                            break;
                        default:
                            permisoEncontrado = obtenerTituloPermiso(filtro, nivel, arbolPermisos, child);
                            res += '- ' + permisoEncontrado.title;
                    }
                }
            }
        }

        if (nivel < permArray.length - 1) {
            let permisosFiltrados = arregloImprimir.filter((perm: string) => {
                return filtro === perm.substr(0, filtro.length);
            });
            res = obtenerArreglosMismoNivel(permisosFiltrados, nivel + 1, res, keysYaImpresas, arbolPermisos, permisoEncontrado, prestaciones);
            return res;
        }
    });
    return res;
}

function obtenerTituloPermiso(permisoString: string, nivel: number, arbolPermisos?: IPermiso[], permiso?: IPermiso): IPermiso {
    // permisoString = a:b:c:d    nivel: 2  -> debe traer el titulo de c
    let res = '';
    let keys = permisoString.split(':');
    let permisoBuscado: IPermiso;
    permisoBuscado = (permiso ? permiso.child : arbolPermisos).find((perm: IPermiso) => {
        return perm.key === keys[nivel];
    });
    return permisoBuscado;
}



export function agregarPermiso(permisosUsuario: string[], permisosAgregar: string[]): string[] {
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
            } else if (arrayPermisoUsuario[i] === '*') { // (arrayPermisoUsuario.length > arrayPermisoPerfil.length) {// (arrayPermisoUsuario[i] === '*') { // permiso log:* viene como log a secas, no guiarse con que termine en *
                return relaciones.padre;
            } else if (arrayPermisoPerfil[i] === '*') { // (arrayPermisoUsuario.length < arrayPermisoPerfil.length) {// (arrayPermisoPerfil[i] === '*') {
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
