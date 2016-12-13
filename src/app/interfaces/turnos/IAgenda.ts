import { IProfesional } from '../IProfesional';
import { IPrestacion } from './IPrestacion';
import { IBloque } from './IBloque';

export interface IAgenda{
    id: String,
    nombre: String,
    prestaciones: IPrestacion[],
    profesionales: IProfesional[],
    espacioFisico:  {
        id: String,
        nombre: String
    },
    horaInicio: Date,
    horaFin: Date,
    bloques: IBloque[],
    estado: String
}