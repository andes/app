
export interface IPacienteRelacionReferencia {
    id?: string;
    _id?: string;
    nombre: string;
    apellido: string;
    documento?: string;
    numeroIdentificacion?: string;
    fechaNacimiento?: Date;
    fechaFallecimiento?: Date;
    fotoId?: any;
    sexo?: string;
    genero?: string;
    activo?: boolean;
    alias?: string;
}

export interface IPacienteRelacion {
    relacion: {
        id: string;
        nombre: string;
        opuesto: string;
        esConviviente?: boolean;
    };
    referencia: IPacienteRelacionReferencia; // siempre populado desde la API
}
