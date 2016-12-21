import { IPrestacion } from './IPrestacion';
export interface ITurno{
    horaInicio: Date,
    estado: String,
    paciente:  {
        id: String,
        nombre: String,
        apellido: String,
        documento: String
    },
    pacientes:  [{
        id: String,
        nombre: String,
        apellido: String,
        documento: String
    }],
    prestacion: IPrestacion
}