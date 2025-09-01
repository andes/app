export interface ICampaniaSalud {
    id?: string;
    asunto: string;
    cuerpo: string;
    link: string;
    imagen: string;
    target?: {
        sexo?: string;
        grupoEtario?: {
            desde?: number;
            hasta?: number;
        };
    };
    /**
     * Desde y hasta cuando debería esta publicada la campaña
     *
     * @type {{
     *         desde: Date,
     *         hasta: Date
     *     }}
     * @memberof ICampaniaSalud
     */
    vigencia: {
        desde: Date;
        hasta: Date;
    };

    /**
     * Fecha que se utiliza en la app mobile para mandar notificaciones push
     *
     * @type {Date}
     * @memberof ICampaniaSalud
     */
    fechaPublicacion: Date;
    /**
     * Estado de la campaña. Solo se publican las campañas que están activas. Con este campo
     * se puede ocultar la publicación por más que se encuentre dentro del periodo de vigencia.
     * Si se necesita por escrito si está activo o no, utilizar el método en el servicio para
     * mostrar la misma etiqueta.
     * @type {boolean}
     * @memberof ICampaniaSalud
     */
    activo: boolean;
    /**
     * Texto que se muestra en el botón. Tiene una opción por defecto cargada en la API
     *
     * @type {String}
     * @memberof ICampaniaSalud
     */
    textoAccion?: string;
}
