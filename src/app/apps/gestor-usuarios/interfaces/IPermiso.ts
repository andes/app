export interface IPermiso {
    /**
     * Valor que se guarda en la base de datos para identificar el permiso asignado
     * @type {string}
     * @memberof IPermiso
     */
    key: string;
    /**
     * Valor que se muestra en el árbol de permisos
     * @type {string}
     * @memberof IPermiso
     */
    title: string;
    comment?: string;
    /**
     * Subpermisos. Se separan con : al guardar en base de datos -> keyPermiso:keyPermisoChild
     * @type {IPermiso[]}
     * @memberof IPermiso
     */
    child?: IPermiso[];
    type?: string;
    subtype?: string;
    /**
     * Si se permite o no marcar todos los permisos hijos de este permiso
     * @type {boolean}
     * @memberof IPermiso
     */
    avoidAll?: boolean;
}
