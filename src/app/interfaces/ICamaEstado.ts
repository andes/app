import { IPaciente } from './IPaciente';

export interface ICamaEstado {
    idCama: String;
    estado: String;
    paciente: IPaciente;
    idInternacion: String;
    observaciones: String;
};
