export interface IDemanda {
    profesional: {
        id: string;
        nombre: string;
        apellido: string;
    };
    organizacion: {
        id: string;
        nombre: string;
    };
    motivo: string;
    fecha: Date;
    origen: string;
}

export interface IListaEspera {
    id?: string;
    paciente: { id: string };
    tipoPrestacion: any;
    fecha: Date;
    vencimiento?: Date;
    estado: string;
    demandas: [IDemanda];
    resolucion: {
        fecha: Date;
        motivo: string;
        observacion: string;
        turno: {
            id: string;
            idAgenda: string;
            organizacion: {
                id: string;
                nombre: string;
            };
            horaInicio: Date;
            tipo: string;
            emitidoPor: string;
            fechaHoraDacion: Date;
            profesional: string;
        };
    };
    llamados?: ILlamado[];
}

export interface ILlamado {
    estado?: string;
    comentario?: string;
}
