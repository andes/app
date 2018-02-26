import { IPaciente } from './IPaciente';

export interface ICamaEstado {
    fechas: Date;
    estado: String;
    paciente: IPaciente;
    idInternacion: String;
    observaciones: String;
};
