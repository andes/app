
export interface IEspecialidad {
    id: string;
    nombre: string;
    descripcion: string;
    disciplina: string;
    complejidad: number;
    codigo: {
        sisa: string;
    };
    activo: boolean;
    fechaAlta: Date;
    fechaBaja: Date;
}
