import { ITipoPrestacion } from './../ITipoPrestacion';
import { IBloque } from './IBloque';

export interface IAgenda {
    id: String;
    tipoPrestaciones: ITipoPrestacion[];
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
