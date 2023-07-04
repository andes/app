export interface ICreatedBy {
    documento: number;
    username: number;
    apellido: string;
    nombre: string;
    nombreCompleto: string;
    organizacion: {
        id: string;
        nombre: string;
    };
}
