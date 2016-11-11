import { IProfesional } from '../IProfesional';
import { IPrestacion } from './IPrestacion';
import { IBloque } from './IBloque';

export interface IPlantilla{
    id: String,
    descripcion: String,
    prestaciones: IPrestacion[],
    profesionales: IProfesional[],
    espacioFisico:  {
        id: String,
        nombre: String
    },
    
    bloques: IBloque[]
}