import { IOrganizacion } from '../../../interfaces/IOrganizacion';

export interface IPerfilUsuario {
    id?: string;
    nombre: string;
    permisos: string[];
    /**
     *Organización a la que aplica este perfil de usuario (permisos). Si está vacía es porque se trata de un perfil global
     *
     * @type {IOrganizacion}
     * @memberof IPerfilUsuario
     */
    organizacion: IOrganizacion;
    /**
     * Si está habilitado el perfil para usarse o no. Cuando está desactivado, no debería mostrarse en el listado de perfiles para asignar
     * estos permisos a un usuario
     * @type {Boolean}
     * @memberof IPerfilUsuario
     */
    activo: Boolean;
}
