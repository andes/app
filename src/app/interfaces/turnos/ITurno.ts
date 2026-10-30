import { ITipoPrestacion } from './../ITipoPrestacion';
import { IObraSocial } from './../IObraSocial';
import { CondicionPaciente } from '../../modules/rup/interfaces/prestacion.interface';

// TODO: Recordar actualizar Schema!
export interface ITurno {
    _id: string;
    id: string;
    horaInicio: Date;
    estado: string;
    asistencia: string;
    paciente: {
        id: string;
        nombre: string;
        apellido: string;
        alias: string;
        documento: string;
        fechaNacimiento: Date;
        telefono: String;
        sexo: String;
        carpetaEfectores: [{
            organizacion: string;
            nroCarpeta: string;
        }];
        obraSocial: IObraSocial;

    };
    tipoPrestacion: ITipoPrestacion;
    idPrestacionPaciente: string;
    tipoTurno: string;
    reasignado: {
        anterior: {
            idAgenda: string;
            idBloque: string;
            idTurno: string;
        };
        siguiente: {
            idAgenda: string;
            idBloque: string;
            idTurno: string;
        };
    };
    carpetaEfectores?: [{
        organizacion: {
            id: string;
            nombre: string;
        };
        nroCarpeta: string;
    }];
    nota: string;
    condicionPaciente?: CondicionPaciente;
    motivoSuspension: string;
    avisoSuspension: {
        type: string;
        enum: ['pendiente', 'no enviado', 'enviado', 'fallido'];
    };
    notificar: boolean;
    videoConferencia?: boolean;
    webexLinks?: {
        patientLink: string;
        professionalLink: string;
    };
}

export interface IHistorialTurno extends ITurno {
    organizacion: {
        id?: string;
        nombre: string;
    };
}
