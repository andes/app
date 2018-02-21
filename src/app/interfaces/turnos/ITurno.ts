import { ITipoPrestacion } from './../ITipoPrestacion';
import { IObraSocial } from './../IObraSocial';

// TODO: Recordar actualizar Schema!
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
        fechaNacimiento: Date,
        telefono: String,
        sexo: String
        carpetaEfectores: [{
            organizacion: string,
            nroCarpeta: string
        }],
        obraSocial: IObraSocial
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
    motivoSuspension: {
        type: String,
        enum: ['edilicia', 'profesional', 'organizacion', 'agendaSuspendida']
    },
    avisoSuspension: {
        type: String,
        enum: ['pendiente', 'no enviado', 'enviado', 'fallido']
    },
}
