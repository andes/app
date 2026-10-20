import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';

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

export type IPacienteListaEspera = IPaciente & { _id?: string };

export interface IListaEspera {
    _id?: string;
    id?: string;
    paciente: IPacienteListaEspera;
    tipoPrestacion: any;
    fecha: Date;
    vencimiento?: Date;
    estado: string;
    motivos?: string[];
    demandas: IDemanda[];
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
    createdAt?: Date;
    createdBy?: {
        nombreCompleto?: string;
    };
}
