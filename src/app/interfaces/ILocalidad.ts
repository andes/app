export interface ILocalidad {
    id: string;
    nombre: string;
    provincia: {
        id: string;
        nombre: string;
    };
}
