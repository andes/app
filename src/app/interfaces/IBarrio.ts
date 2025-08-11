export interface IBarrio {
    id: string;
    nombre: string;
    localidad: {
        _id: string;
        nombre: string;
    };
}
