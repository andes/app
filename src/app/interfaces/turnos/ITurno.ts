import { ITipoPrestacion } from './../ITipoPrestacion';
import { IObraSocial } from './../IObraSocial';
import { IFinanciador } from '../IFinanciador';

// TODO: Recordar actualizar Schema!
export interface ITurno {
    id: string;
    horaInicio: Date;
    estado: string;
    asistencia: string;
    paciente: {
        id: string,
        nombre: string,
        apellido: string,
        alias: string,
        documento: string,
        fechaNacimiento: Date,
        telefono: String,
        sexo: String,
        carpetaEfectores: [{
            organizacion: string,
            nroCarpeta: string
        }],
        obraSocial: IFinanciador

    };
    tipoPrestacion: ITipoPrestacion;
    idPrestacionPaciente: string;
    tipoTurno: string;
    reasignado: {
        anterior: {
            idAgenda: string,
            idBloque: string,
            idTurno: string
        }
        siguiente: {
            idAgenda: string,
            idBloque: string,
            idTurno: string
        }
    };
    carpetaEfectores?: [{
        organizacion: {
            id: string,
            nombre: string
        },
        nroCarpeta: string
    }];
    nota: string;
    motivoSuspension: {
        type: string,
        enum: ['edilicia', 'profesional', 'organizacion', 'agendaSuspendida']
    };
    avisoSuspension: {
        type: string,
        enum: ['pendiente', 'no enviado', 'enviado', 'fallido']
    };
}
