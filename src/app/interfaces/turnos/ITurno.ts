import { IPrestacion } from './IPrestacion';
export interface ITurno {
    id: String;
    horaInicio: Date;
    estado: String;
    asistencia: Boolean,
    paciente: {
        id: String,
        nombre: String,
        apellido: String,
        documento: String,
        telefono: String
    };
    pacientes: [{
        id: String,
        nombre: String,
        apellido: String,
        documento: String
    }];
    prestacion: IPrestacion;
}
