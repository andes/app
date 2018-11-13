import { IPracticaMatch } from './IPracticaMatch.inteface';

export interface IPracticaBuscarResultado {
    err: any;
    practicas: IPracticaMatch[];
}
