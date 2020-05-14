export interface IPrestacionEstado {
    id: string;
    tipo: string;
    idOrigenModifica: string;
    createdBy: {
        id: string;
        nombre: string;
        apellido: string;
        nombreCompleto: string;
        username: number;
        documento: string;
        organizacion: {
            id: string;
            nombre: string;
        }
    };
}
