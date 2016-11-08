import { IProfesional } from '../IProfesional';
import { IPrestacion } from './IPrestacion';
import { IBloque } from './IBloque';

export interface IPlantilla{
    prestacion: IPrestacion[],
    profesionales: IProfesional[],
    espacioFisico:  {
        id: String,
        nombre: String
    },
    descripcion: String,
    bloques: IBloque[]
}