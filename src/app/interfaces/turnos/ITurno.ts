import { ITipoPrestacion } from './../ITipoPrestacion';

// Recordar actualizar Schema!
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
    tipoPrestacion: ITipoPrestacion;
    idPrestacionPaciente: String;
    tipoTurno: String;
    nota: String;
}
