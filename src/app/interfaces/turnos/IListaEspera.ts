import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';

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

export type IPacienteListaEspera = IPaciente & { _id?: string };

export interface IListaEspera {
    _id?: string;
    id?: String;
    paciente: IPacienteListaEspera;
    tipoPrestacion: any;
    fecha: Date;
    vencimiento?: Date;
    estado: String;
    motivos?: String[];
    demandas: IDemanda[];
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
    createdAt?: Date;
    createdBy?: {
        nombreCompleto?: string;
    };
}
