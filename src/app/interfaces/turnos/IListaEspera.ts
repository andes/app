export interface IDemanda {
    profesional: {
        id: String;
        nombre: String;
        apellido: String;
    };
    organizacion: {
        id: String;
        nombre: String;
    };
    motivo: String;
    fecha: Date;
    origen: String;
};

export interface IListaEspera {
    id?: String;
    paciente: {
        id: String;
        nombre: String;
        apellido: String;
        documento: String;
    };
    tipoPrestacion: any;
    fecha: Date;
    vencimiento?: Date;
    estado: String;
    demandas: [IDemanda];
    resolucion: {
        fecha: Date;
        motivo: String;
        observacion: String;
        turno: {
            id: String;
            idAgenda: String;
            organizacion: {
                id: String;
                nombre: String;
            };
            horaInicio: Date;
            tipo: String;
            emitidoPor: String;
            fechaHoraDacion: Date;
            profesional: String;
        };
    };
    llamados?: ILlamado[];
}

export interface ILlamado {
    estado?: string;
    comentario?: string;
}
