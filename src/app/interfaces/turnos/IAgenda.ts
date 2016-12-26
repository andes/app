import { IProfesional } from '../IProfesional';
import { IPrestacion } from './IPrestacion';
import { IBloque } from './IBloque';
import { ITurno } from './ITurno';

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
    intercalar: Boolean,
    bloques: IBloque[],
    estado: String 
}