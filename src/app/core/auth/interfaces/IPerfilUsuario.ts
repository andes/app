import { IOrganizacion } from '../../../interfaces/IOrganizacion';

export interface IPerfilUsuario {
    id?: String;
    nombre: string;
    permisos: [string];
    /**
     *Organización a la que aplica este perfil de usuario (permisos). Si está vacía es porque se trata de un perfil global
     *
     * @type {IOrganizacion}
     * @memberof IPerfilUsuario
     */
    organizacion: IOrganizacion;
}
