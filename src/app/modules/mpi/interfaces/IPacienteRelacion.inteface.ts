
export interface IPacienteRelacion {
    relacion: {
        id: string,
        nombre: string,
        opuesto: string
    };
    referencia: string;
    nombre: string;
    apellido: string;
    documento: string;
    numeroIdentificacion: string;
    fechaNacimiento?: Date;
    sexo?: string;
    foto: string;
}
