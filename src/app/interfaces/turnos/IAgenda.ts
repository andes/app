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
    espacioFisico: {
        id: String,
        nombre: String
    };
    horaInicio: Date;
    horaFin: Date;
    intercalar: Boolean;
    bloques: IBloque[];
    estado: String;
    prePausada: String;
    turnosDisponibles: number;
    estadosAgendas: String[];
    organizacion: {
        id: String,
        nombre: String
    },
    nota: String;
}
