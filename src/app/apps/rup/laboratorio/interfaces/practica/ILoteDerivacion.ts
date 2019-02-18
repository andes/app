export interface ILoteDerivacion {
    id?: string;
    numeroLote?: string;
    fecha?: Date;
    laboratorioOrigen: {
        nombre: string,
        id: string
    };
    laboratorioDestino?: {
        nombre: string,
        id: string
    };
    estados: [{
        tipo: String
    }];
    registrosPracticas: [{
        idPrestacion: String,
        numeroProtocolo: String,
        paciente: {
            id: string,
            documento: String,
            apellido: String,
            nombre: String
        };
        registro: any
    }?];
    usuarioResponsablePreparacion?: String;
    usuarioEntrega?: String;
}
