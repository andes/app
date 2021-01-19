import { ITurno } from './ITurno';
import { ITipoPrestacion } from './../ITipoPrestacion';
import { IBloque } from './IBloque';
import { IEspacioFisico } from './IEspacioFisico';

// Recordar actualizar Schema!

export interface IAgenda {
    id: String;
    tipoPrestaciones: ITipoPrestacion[];
    // profesionales: IProfesional[];
    profesionales: [{
        id: String,
        nombre: String,
        apellido: String
    }];
    organizacion: {
        id: String,
        nombre: String
    };
    espacioFisico: {
        id: String,
        nombre: String,
        servicio: {
            id: String,
            nombre: String
        };
        sector: {
            id: String,
            nombre: String
        };
    };
    otroEspacioFisico: IEspacioFisico;
    horaInicio: Date;
    horaFin: Date;
    intercalar: Boolean;
    bloques: IBloque[];
    estado: String;
    prePausada: String;
    sobreturnos?: ITurno[];
    turnosDisponibles: number; // Virtual
    turnosRestantesDelDia: number; // Virtual
    turnosRestantesProgramados: number; // Virtual
    turnosRestantesGestion: number; // Virtual
    turnosRestantesProfesional: number; // Virtual
    estadosAgendas: String[];
    nota: String;
    nominalizada: Boolean;
    dinamica: Boolean;
    cupo: Number;
    avisos: [{
        profenionalId: String,
        estado: String,
        fecha: Date
    }];
    enviarSms: String;
    modificadorLlave: boolean;
}
