import { IArgumentoQuery } from './IArgumentoQuery';

export interface IFiltroQuery {
    _id: string;
    nombre: string; // nombre de consulta
    coleccion: string;
    query: string;
    argumentos: IArgumentoQuery[];
}
