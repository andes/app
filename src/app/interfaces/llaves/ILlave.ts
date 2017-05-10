export interface ILlave {
    id: String;
    edad: {
        desde: {
            valor: Number,
            unidad: String
        },
        hasta: {
            valor: Number,
            unidad: String
        }
    };
    sexo: String;
    solicitud: {
        requerida: Boolean;
        vencimiento: {
            valor: Number,
            unidad: String
        }
    };
}