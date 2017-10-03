export interface ILocalidad {
    id: String;
    nombre: String;
    provincia: {
        id: String,
        nombre: String
    };
}
