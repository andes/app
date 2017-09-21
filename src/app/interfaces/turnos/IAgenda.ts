import { ITipoPrestacion } from './../ITipoPrestacion';
import { IBloque } from './IBloque';

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
    horaInicio: Date;
    horaFin: Date;
    intercalar: Boolean;
    bloques: IBloque[];
    estado: String;
    prePausada: String;
    turnosDisponibles: number; // Virtual
    turnosRestantesDelDia: number; // Virtual
    turnosRestantesProgramados: number; // Virtual
    turnosDisponiblesGestion: number; // Virtual
    turnosDisponiblesProfesional: number; // Virtual
    estadosAgendas: String[];
    nota: String;
    nominalizada: Boolean;
    avisos: [{
        profenionalId: String,
        estado: String,
        fecha: Date
    }];
}
