export interface IListaEspera {
    id: String;
    fecha: Date;
    vencimiento: Date;
    estado: String;
    profesional: {
        id: String,
        nombre: String,
        apellido: String
    };
    prestacion: {
        id: String,
        nombre: String
    };
    paciente: {
        id: String,
        nombre: String,
        apellido: String,
        documento: String
    };
}
