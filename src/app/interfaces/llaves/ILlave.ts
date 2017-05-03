export interface ILlave {
    id: String;
    edad: {
        desde: Number,
        hasta: Number
    };
    sexo: String;
    solicitud: {
        requerida: Boolean;
        vencimiento: Date
    };
}