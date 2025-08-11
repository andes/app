export interface IUbicacion {
    barrio: {
        id: string;
        nombre: string;
    };
    localidad: {
        id: string;
        nombre: string;
    };
    provincia: {
        id: string;
        nombre: string;
    };
    pais: {
        id: string;
        nombre: string;
    };
    lugar?: string;
}
