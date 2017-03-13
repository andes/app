import { ITipoPrestacion } from './../ITipoPrestacion';
export interface ITurno {
    id: String;
    horaInicio: Date;
    estado: String;
    asistencia: Boolean;
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
    tipoPrestacion: ITipoPrestacion;
    idPrestacionPaciente: String;
}
