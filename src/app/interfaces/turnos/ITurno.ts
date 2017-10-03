import { ITipoPrestacion } from './../ITipoPrestacion';

// Recordar actualizar Schema!
export interface ITurno {
    id: String;
    horaInicio: Date;
    estado: String;
    asistencia: String;
    paciente: {
        id: String,
        nombre: String,
        apellido: String,
        documento: String,
        telefono: String,
    };
    tipoPrestacion: ITipoPrestacion;
    idPrestacionPaciente: String;
    tipoTurno: String;
    reasignado: {
        anterior: {
            idAgenda: String,
            idBloque: String,
            idTurno: String
        }
        siguiente: {
            idAgenda: String,
            idBloque: String,
            idTurno: String
        }
    };
    carpetaEfectores?: [{
        organizacion: {
            id: string,
            nombre: string
        },
        nroCarpeta: string
    }];
    nota: String;
}
