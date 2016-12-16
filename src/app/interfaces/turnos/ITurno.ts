import { IPrestacion } from './IPrestacion';
export interface ITurno{
    horaInicio: Date,
    estado: String,
    paciente:  {
        id: String,
        nombre: String,
        apellido: String
    },
    pacientes:  [{
        id: String,
        nombre: String,
        apellido: String
    }],
    prestacion: IPrestacion
}