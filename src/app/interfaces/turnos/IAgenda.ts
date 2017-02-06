import { IProfesional } from '../IProfesional';
import { IPrestacion } from './IPrestacion';
import { IBloque } from './IBloque';

export interface IAgenda {
    id: String;
    prestaciones: IPrestacion[];
    // profesionales: IProfesional[];
    profesionales: [
        {
             id: String,
             nombre: String,
             apellido: String
        }
    ];
    espacioFisico:  {
        id: String,
        nombre: String
    };
    horaInicio: Date;
    horaFin: Date;
    intercalar: Boolean;
    bloques: IBloque[];
    estado: String;
    turnosDisponibles: number;
}
