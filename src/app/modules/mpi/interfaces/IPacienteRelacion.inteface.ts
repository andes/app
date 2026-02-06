
export interface IPacienteRelacion {
    id?: string;
    relacion: {
        id: string;
        nombre: string;
        opuesto: string;
        esConviviente?: boolean;
    };
    referencia: any;
    nombre?: string;
    apellido?: string;
    documento?: string;
    numeroIdentificacion?: string;
    fechaNacimiento?: Date;
    fechaFallecimiento?: Date;
    sexo?: string;
    foto?: any;
    fotoId?: any;
    activo?: boolean;
    alias?: string;
    genero?: string;
}
