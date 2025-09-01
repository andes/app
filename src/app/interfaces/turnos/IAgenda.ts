import { ITurno } from './ITurno';
import { ITipoPrestacion } from './../ITipoPrestacion';
import { IBloque } from './IBloque';
import { IEspacioFisico } from './IEspacioFisico';

// Recordar actualizar Schema!

export interface IAgenda {
    id: string;
    _id: string;
    tipoPrestaciones: ITipoPrestacion[];
    // profesionales: IProfesional[];
    profesionales: [{
        id: string;
        nombre: string;
        apellido: string;
    }];
    organizacion: {
        id: string;
        nombre: string;
    };
    espacioFisico: {
        id: string;
        nombre: string;
        servicio: {
            id: string;
            nombre: string;
        };
        sector: {
            id: string;
            nombre: string;
        };
    };
    otroEspacioFisico: IEspacioFisico;
    horaInicio: Date;
    horaFin: Date;
    intercalar: boolean;
    bloques: IBloque[];
    estado: string;
    prePausada: string;
    sobreturnos?: ITurno[];
    turnosDisponibles: number; // Virtual
    turnosRestantesDelDia: number; // Virtual
    turnosRestantesProgramados: number; // Virtual
    turnosRestantesGestion: number; // Virtual
    turnosRestantesProfesional: number; // Virtual
    estadosAgendas: string[];
    nota: string;
    link: string;
    nominalizada: boolean;
    dinamica: boolean;
    multiprofesional: boolean;
    cupo: number;
    avisos: [{
        profenionalId: string;
        estado: string;
        fecha: Date;
    }];
    enviarSms: string;
    condicionLlave: boolean;
}
