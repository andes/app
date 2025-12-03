import { ITurno } from './ITurno';
import { ITipoPrestacion } from './../ITipoPrestacion';
import { IBloque } from './IBloque';
import { IEspacioFisico } from './IEspacioFisico';

// Recordar actualizar Schema!

export interface IAgenda {
    id: String;
    _id: String;
    tipoPrestaciones: ITipoPrestacion[];
    // profesionales: IProfesional[];
    profesionales: [{
        id: String;
        nombre: String;
        apellido: String;
    }];
    organizacion: {
        id: String;
        nombre: String;
    };
    espacioFisico: {
        id: String;
        nombre: String;
        servicio: {
            id: String;
            nombre: String;
        };
        sector: {
            id: String;
            nombre: String;
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
    link: String;
    nominalizada: Boolean;
    dinamica: Boolean;
    multiprofesional: boolean;
    cupo: Number;
    avisos: [{
        profenionalId: String;
        estado: String;
        fecha: Date;
    }];
    enviarSms: String;
    condicionLlave: boolean;
    createdAt: Date;
    createdBy: {
        id: string;
        nombre: string;
        apellido: string;
        nombreCompleto: string;
        username: number;
        documento: string;
        organizacion: {
            id: string;
            nombre: string;
        };
    };
}
